import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TsLambdaSnsSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
    });
  }
}
