const swaggerJSDoc = require("swagger-jsdoc");
const { serve, setup } = require("swagger-ui-express");

module.exports = (app) => {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.1",
      info: {
        title: "Backend project Coderhouse",
        description: "API for ecommerce",
      },
    },
    apis: [`${__dirname}/../docs/**/*.yaml`],
  };
  const specs = swaggerJSDoc(swaggerOptions);
  app.use("/apidocs", serve, setup(specs));
};
