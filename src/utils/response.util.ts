export class ResponseUtil {
  static success(message: string, data: any = null) {
    return {
      status: "SUCCESS",
      code: "0000",
      statusCode: 200,
      message,
      data,
    };
  }
}