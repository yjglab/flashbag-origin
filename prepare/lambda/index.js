const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name; // flashbag-origin
  const Key = decodeURIComponent(event.Records[0].s3.object.key); // original/1039492_abc.jpg
  const filename = Key.split("/")[Key.split("/").length - 1]; // 1039492_abc.jpg
  const ext = Key.split(".")[Key.split(".").length - 1].toLowerCase();
  const requiredFormat = ext === "jpg" ? "jpeg" : ext;

  try {
    const s3Object = await s3.getObject({ Bucket, Key }).promise();
    const resizedImage = await sharp(s3Object.Body)
      .resize(400, 400, {
        fit: "inside",
      })
      .toFormat(requiredFormat)
      .toBuffer(); // Body: 이미지 바이너리값

    await s3
      .putObject({
        Bucket,
        Key: `thumb/${filename}`,
        Body: resizedImage,
      })
      .promise();
    return callback(null, `thumb/${filename}`); // 에러는 null, 어떤 이미지를 만들었는지.
  } catch (error) {
    console.error(error);
    return callback(error); // passport의 done과 비슷
  }
}; // 이름을 기억해둘것. handler

/*
event 인수 : s3 업로드 이벤트


*/
