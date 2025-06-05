const { sum } = require("./sum");

exports.handler = async () => {
  console.log("Hello World! Iam Shiun smk!");
  // 必要に応じて、他の処理を追加できます。
  const a = Math.floor(Math.random() * 100) + 1;
  const b = Math.floor(Math.random() * 100) + 1;
  const result = sum(a, b);

  throw new Error("This is a test error!"); // エラーを発生させる
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `I am Shiun smk!, ${a} + ${b} = ${result}`,
    }),
  };
};
