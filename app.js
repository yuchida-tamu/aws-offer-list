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

inquirer
  .prompt([
    questionRegion,
    questionService,
    questionInstance,
    questionOperation,
  ])
  .then((answers) => {
    checkAPI(
      answers.service,
      answers.region,
      answers.operation,
      answers.instance
    );
  })
  .catch((err) => {
    console.error("Something went wrong: ", err);
  });

async function checkAPI(awsService, region, operation, instanceType) {
  try {
    const regionIndexResponse = await api.get(
      `/offers/v1.0/aws/${awsService}/current/region_index.json`
    );
    const currentVersionUrl =
      regionIndexResponse.data.regions[region].currentVersionUrl;
    const currentVersionResponse = await api.get(currentVersionUrl);
    const products = currentVersionResponse.data.products;

    const answer = Object.values(products).filter(
      (product) =>
        product.attributes.instanceType === instanceType &&
        product.attributes.operation === operation
    );

    console.log(answer);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
