const readline = require("readline");
const inquirer = require("inquirer");
const regionOptions = require("./regions");
const axios = require("axios");
let region, awsService, instanceType, operation;
region = "ap-northeast-1";
awsService = "AmazonRDS";

let queryParams = {
  region: "ap-northeast-1",
  service: "AmazonRDS",
};

const api = axios.create({
  baseURL: `https://pricing.us-east-1.amazonaws.com/`,
});

//create questions

const questionRegion = {
  type: "list",
  name: "region",
  message: "リージョンを選んでください。Please, pick a region",
  choices: regionOptions,
};

const questionService = {
  type: "list",
  name: "service",
  message: "サービスを選んでください。Please, pick a service",
  choices: ["AmazonRDS", "AmazonEC2"], //TODO increase services, export it out to make it more manageable
};

const questionInstance = {
  name: "instance",
  message:
    "インスタンスタイプを入力してください。Please, enter an instance type",
};

const questionOperation = {
  name: "operation",
  message:
    "オペレーション名を入力してください。　Please, enter an operation name",
};

async function run() {
  try {
    const { region } = await inquirer.prompt([questionRegion]);

    const { service } = await inquirer.prompt([questionService]);

    const { instance } = await inquirer.prompt([questionInstance]);

    const { operation } = await inquirer.prompt([questionOperation]);

    await checkAPI(service, region, operation, instance);
  } catch (err) {
    console.error("Something went wrong: ", err);
  }
}

run();

function checkAPI(awsService, region, operation, instanceType) {
  Promise.resolve()
    .then(() => {
      return api.get(
        `/offers/v1.0/aws/${awsService}/current/region_index.json`
      );
    })
    .then((response) => {
      const currentVersionUrl = response.data.regions[region].currentVersionUrl;
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
}
