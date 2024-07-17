"use strict";
const cors = require('cors');
const express = require('express');
const server = express();
const axios = require('axios');
const headers = { 'Content-Type': 'application/json' };
const os = require("os");
const WebPort = 8080;


const meals = ['飦集', '猪角', '半斤牛肉', '大米先生', '老乡鸡', '兰州拉面', '猪脚饭', "肥肠粉", "鸡公煲"];
const webhookUrl = 'https://open.feishu.cn/open-apis/bot/v2/hook/3447cff8-3872-4dd8-acd5-6867159b781a'; // 替换为您实际的Webhook URL

async function main() {
    server.use(cors());
    server.use(express.json())

    server.options('/RandomDayEat', cors());
    server.post("/RandomDayEat", (req, res) => {
        try {
            RandomDayEatAndSendToFeishu();
            res.statusCode = 200;
            res.json("发送成功");
        } catch (error) {
            res.statusCode = 400;
            res.json("数据解析失败");
        }
    });
    server.use(express.static('./web'));
    server.listen(WebPort, () => {
        const networkInterfaces = os.networkInterfaces();
        const ipAddress = networkInterfaces['wlan0'] ? networkInterfaces['wlan0'][0].address : 'localhost';
        const url = `http://${ipAddress}:${WebPort}`;
        console.log(`Random Day Eat Server running on ${url}`);
    });


}


function getRandomMeal(previousMeals) {
    const availableMeals = meals.filter(meal => !previousMeals.includes(meal));
    if (availableMeals.length === 0) {
        return '这周没有更多独特的餐点了！';
    }
    const randomIndex = Math.floor(Math.random() * availableMeals.length);
    const randomMeal = availableMeals[randomIndex];
    return randomMeal;
}

/**
 * 发送消息
 * @param {*} message 
 */
async function sendFeishuMessageWithWebHookUrl(message) {
    try {
        console.log(`sendFeishuMessageWithWebHookUrl: \n${message}`);
        const response = await axios.post(webhookUrl, {
            "msg_type": 'text',
            "content": {
                "text": message,
            },
        }, { headers });
        if (response.data.code === 0) {
            console.log('消息发送成功');
        } else {
            console.log('消息发送失败:' + response.data.message);
            console.log(response);
        }
    } catch (error) {
        console.log('消息发送失败:' + error);
    }
}


function RandomDayEatAndSendToFeishu() {
    // 示例用法:
    let previousMeals = [];
    let message = '';
    for (let i = 0; i < 5; i++) {
        const randomMeal = getRandomMeal(previousMeals);
        previousMeals.push(randomMeal);
        message += `第 ${i + 1} 天: ${randomMeal}\n`;
    }
    sendFeishuMessageWithWebHookUrl(message);
}

main();