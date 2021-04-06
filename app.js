const readline = require("readline");
const axios = require("axios");
let region, awsService, instanceType, operation;
region = "ap-northeast-1";
awsService = "AmazonRDS";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const api = axios.create({
  baseURL: `https://pricing.us-east-1.amazonaws.com/`,
});

rl.question("Choose Your region (ap-northeast, us-east-1...): ", (answer) => {
  region = answer;
  rl.question("Choose AWS Service (AmazonEC2, AmazonRDS...): ", (answer) => {
    awsService = answer;
    rl.question(
      "Choose instance type (m5.large, db.t3.xlarge etc...): ",
      (answer) => {
        instanceType = answer;
        rl.question(
          "Choose operation (CreateDBInstance:0015 etc...): ",
          (answer) => {
            operation = answer;
            Promise.resolve()
              .then(() => {
                return api.get(
                  `/offers/v1.0/aws/${awsService}/current/region_index.json`
                );
              })
              .then((response) => {
                const currentVersionUrl =
                  response.data.regions[region].currentVersionUrl;
                return api.get(currentVersionUrl);
              })
              .then((result) => {
                const products = result.data.products;
                const answer = [];

                for (key in products) {
                  let product = products[key];
                  if (
                    product.attributes.instanceType === instanceType &&
                    product.attributes.operation === operation
                  ) {
                    answer.push(product);
                  }
                }
                console.log(answer);
              })
              .catch((err) => {
                console.log(err);
                process.exit(1);
              });
            rl.close();
          }
        );
      }
    );
  });
});

// Promise.resolve()
//   .then(() => {
//     return api.get(`/offers/v1.0/aws/${awsService}/current/region_index.json`);
//   })
//   .then((response) => {
//     const currentVersionUrl = response.data.regions[region].currentVersionUrl;
//     return api.get(currentVersionUrl);
//   })
//   .then((result) => {
//     const products = result.data.products;
//     const answer = [];

//     for (key in products) {
//       let product = products[key];
//       if (
//         product.attributes.instanceType === instanceType &&
//         product.attributes.operation === operation
//       ) {
//         answer.push(product);
//       }
//     }

//     console.log(answer);
//   })
//   .catch((err) => {
//     console.log(err);
//     process.exit(1);
//   });
