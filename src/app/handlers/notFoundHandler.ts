type RequestProperties = Record<string, any>;
type HandlerCallback = (
  statusCode: number,
  payload: Record<string, any>,
) => void;

const notFoundHandler = {
  handler: (
    requestProperties: RequestProperties,
    callback: HandlerCallback,
  ) => {
    callback(404, {
      message: 'Your requested URL was not found!',
    });
  },
};

export default notFoundHandler;
