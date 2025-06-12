import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TsLambdaSnsSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // デフォルトは、lambdaはfunctionNameのlogGroupを作成するが、明示的に作成することも可能
    const logGroup = new logs.LogGroup(this, "HelloWorldShiunLambdaLogGroup", {
      logGroupName: "/aws/lambda/CDK-Making-hello-world-shiun-lambda",
      retention: logs.RetentionDays.THREE_MONTHS, // ログの保持期間を3ヶ月に設定, 本番系は1年
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // TypeScriptで記述したLambda関数をデプロイする場合、NodejsFunctionを使うと自動でTypeScriptをesbuildでバンドル
    const lambda = new NodejsFunction(this, "Hello-World-Shiun-Lambda", {
      functionName: `hello-world-shiun-lambda`,
      runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/index.ts"),
      handler: "handler",
      memorySize: 1024,
      architecture: cdk.aws_lambda.Architecture.X86_64,
      timeout: cdk.Duration.seconds(300),
      description: "Hello World Lambda function",
      logGroup: logGroup, // ここで明示的にロググループを指定
    });

    // EventBridge (CloudWatch Events) で日本時間AM3:15に毎日実行
    const rule = new cdk.aws_events.Rule(this, "Daily315JSTRule", {
      schedule: cdk.aws_events.Schedule.cron({
        minute: "15",
        hour: "18", // JST 3:15AM = UTC 18:15 (前日)
        // day, month, year, weekDayはデフォルトで「*」なので省略可
      }),
    });
    rule.addTarget(new cdk.aws_events_targets.LambdaFunction(lambda));

    // SNSトピックの作成
    const topic = new sns.Topic(this, "LambdaErrorTopic", {
      displayName: "Lambda Error Notification Topic",
    });

    // メールサブスクリプションの追加（メールアドレスを適宜変更してください）
    topic.addSubscription(
      new subs.EmailSubscription("tanaka.masato@jp.panasonic.com")
    );

    // Lambdaのエラーメトリクスにアラームを設定
    const errorAlarm = new cloudwatch.Alarm(this, "LambdaErrorAlarm", {
      metric: lambda.metricErrors(),
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: "Alarm when the Lambda function has errors",
    });

    // アラーム発報時にSNSトピックを通知先に設定
    errorAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(topic));
  }
}
