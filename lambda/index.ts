exports.handler = async () => {
  console.log("Hello World!");
  // 必要に応じて、他の処理を追加できます。

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "I am Shiun San!",
    }),
  };
};
