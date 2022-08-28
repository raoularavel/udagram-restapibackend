import AWS = require('aws-sdk');
import axios from 'axios';
import { config } from './config/config';

const c = config.dev;

//Configure AWS
if (c.aws_profile !== "DEPLOYED") {
  var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
  AWS.config.credentials = credentials;
}

export const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: c.aws_region,
  params: { Bucket: c.aws_media_bucket }
});


/* getGetSignedUrl generates an aws signed url to retreive an item
 * @Params
 *    key: string - the filename to be put into the s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getGetSignedUrl(key: string): string {

  const signedUrlExpireSeconds = 60 * 5

  const url = s3.getSignedUrl('getObject', {
    Bucket: c.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds
  });

  return url;
}

/* getPutSignedUrl generates an aws signed url to put an item
 * @Params
 *    key: string - the filename to be retreived from s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getPutSignedUrl(key: string) {

  const signedUrlExpireSeconds = 60 * 5

  const url = s3.getSignedUrl('putObject', {
    Bucket: c.aws_media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds
  });

  return url;
}


export async function filterImage(url: string){
  try {
       return await axios.post(`${process.env.FILTER_SERVER}/filteredimage`, {
          image_url: url
      }, {
          responseType: 'arraybuffer'
      })

  } catch (err) {
      return false;

  }
}


export function uploadFile(fileName: string, res: any) {
 // const image = new Uint8Array(res.data)
  //console.log("Response", image)

  return s3.upload({
    Bucket: c.aws_media_bucket,
    Key: fileName,
    Body: Buffer.from(res.data,"binary"),
    ContentType: res.headers["content-type"]
  }).promise();

}
