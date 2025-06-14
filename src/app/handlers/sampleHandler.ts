type RequestProperties = Record<string, any>;
type HandlerCallback = (
  statusCode: number,
  payload: Record<string, any>,
) => void;

const sampleHandler = {
  handler: (
    requestProperties: RequestProperties,
    callback: HandlerCallback,
  ) => {
    console.log(requestProperties);

    callback(200, {
      message: 'This is a sample url',
    });
  },
};

export default sampleHandler;
