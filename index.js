const util = require('util');
const fs = require('fs');
const TrainingApi = require("@azure/cognitiveservices-customvision-training");
const PredictionApi = require("@azure/cognitiveservices-customvision-prediction");
const msRest = require("@azure/ms-rest-js");

const trainingKey = "2966cacb903e46c09ac6abaa8b5a5c21";
const predictionKey = "a8ae777506024b80baf1c7ad91da8cfb";
const predictionResourceId = "/subscriptions/269b17d9-fcb9-442c-b738-6ed1602de64b/resourceGroups/yoyoman_group/providers/Microsoft.CognitiveServices/accounts/yoyoman";
const endPoint = "https://southcentralus.api.cognitive.microsoft.com/"

const publishIterationName = "FinalTest1";
const setTimeoutPromise = util.promisify(setTimeout);

const credentials = new msRest.ApiKeyCredentials({ inHeader: { "Training-key": trainingKey } });
const trainer = new TrainingApi.TrainingAPIClient(credentials, endPoint);
const predictor_credentials = new msRest.ApiKeyCredentials({ inHeader: { "Prediction-key": predictionKey } });
const predictor = new PredictionApi.PredictionAPIClient(predictor_credentials, endPoint);

async () => {
    console.log("Creating project...");
    const sampleProject = await trainer.createProject("FinalTest");

    /*解決錯誤(開始)*/
    process.on('unhandledRejection', error => {
        console.error('unhandledRejection', error);
        process.exit(1) // To exit with a 'failure' code
      });

    /*解決錯誤(結束)*/

    /*const JJTag = await trainer.createTag(sampleProject.id, "林俊傑");
    const TaylorTag = await trainer.createTag(sampleProject.id, "泰勒斯");
    const HuaTag = await trainer.createTag(sampleProject.id, "華晨宇");*/
    const YangGirlTag = await trainer.createTag(sampleProject.id, "楊丞琳");
    const YangBoyTag = await trainer.createTag(sampleProject.id, "楊洋");

    const sampleDataRoot = "C:/Users/Administrator/myapp";
    console.log("Adding images...");


    let fileUploadPromises = [];

    /*const JJDir = `${sampleDataRoot}/林俊傑`;
    const JJFiles = fs.readdirSync(JJDir);
    JJFiles.forEach(file => {
        fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`${JJDir}/${file}`), { tagIds: [JJTag.id] }));
    });
    const TaylorDir = `${sampleDataRoot}/泰勒斯`;
    const TaylorFiles = fs.readdirSync(TaylorDir);
    TaylorFiles.forEach(file => {
        fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`${TaylorDir}/${file}`), { tagIds: [TaylorTag.id] }));
    });
    const HuaDir = `${sampleDataRoot}/華晨宇`;
    const HuaFiles = fs.readdirSync(HuaDir);
    HuaFiles.forEach(file => {
        fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`${HuaDir}/${file}`), { tagIds: [HuaTag.id] }));
    });*/
    const YangGirlDir = `${sampleDataRoot}/楊丞琳`;
    const YangGirlFiles = fs.readdirSync(YangGirlDir);
    YangGirlFiles.forEach(file => {
        fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`${YangGirlDir}/${file}`), { tagIds: [YangGirlTag.id] }));
    });
    const YangBoyDir = `${sampleDataRoot}/楊洋`;
    const YangBoyFiles = fs.readdirSync(YangBoyDir);
    YangBoyFiles.forEach(file => {
        fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`${YangBoyDir}/${file}`), { tagIds: [YangBoyTag.id] }));
    });
    await Promise.all(fileUploadPromises);

    console.log("Training...");
    let trainingIteration = await trainer.trainProject(sampleProject.id);

    // Wait for training to complete
    console.log("Training started...");
    while (trainingIteration.status == "Training") {
        console.log("Training status: " + trainingIteration.status);
        await setTimeoutPromise(1000, null);
        trainingIteration = await trainer.getIteration(sampleProject.id, trainingIteration.id)
    }
    console.log("Training status: " + trainingIteration.status);

    // Publish the iteration to the end point
    await trainer.publishIteration(sampleProject.id, trainingIteration.id, publishIterationName, predictionResourceId);

    const testFile = fs.readFileSync(`${sampleDataRoot}/Test/test_image.jpg`);

    const results = await predictor.classifyImage(sampleProject.id, publishIterationName, testFile);

    // Show results
    console.log("Results:");
    results.predictions.forEach(predictedResult => {
        console.log(`\t ${predictedResult.tagName}: ${(predictedResult.probability * 100.0).toFixed(2)}%`);
    });
    
    
}
// function cl()
// {
//     document.getElementById("abc").innerHTML=ase;
//     document.getElementById("abce").innerHTML="xxx";
    
// }



