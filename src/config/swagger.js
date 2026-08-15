import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Store Rating Platform API",
      version: "1.0.0",
      description:
        "REST API for Store Rating Platform with authentication, role-based access control, store management, ratings, comments and dashboards.",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "Authentication and password management",
      },
      {
        name: "Admin",
        description: "System administrator APIs",
      },
      {
        name: "Stores",
        description: "Store management APIs",
      },
      {
        name: "Ratings",
        description: "Store rating and review APIs",
      },
      {
        name: "Owner",
        description: "Store owner dashboard APIs",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
              example: "Shubham Kumar",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            address: {
              type: "string",
              example: "Delhi, India",
            },
            role: {
              type: "string",
              enum: [
                "ADMIN",
                "USER",
                "STORE_OWNER",
              ],
            },
          },
        },

        Store: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
              example: "Delhi Super Store",
            },
            email: {
              type: "string",
              format: "email",
              example: "store@example.com",
            },
            address: {
              type: "string",
              example: "Connaught Place, New Delhi",
            },
            averageRating: {
              type: "number",
              nullable: true,
              example: 4.5,
            },
            totalRatings: {
              type: "integer",
              example: 20,
            },
          },
        },

        Rating: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            rating: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              example: 5,
            },
            comment: {
              type: "string",
              nullable: true,
              example: "Excellent service!",
            },
            userId: {
              type: "string",
              format: "uuid",
            },
            storeId: {
              type: "string",
              format: "uuid",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Validation failed",
            },
          },
        },
      },
    },
  },

  apis: [
    "./src/routes/*.js",
  ],

  failOnErrors: true,
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
