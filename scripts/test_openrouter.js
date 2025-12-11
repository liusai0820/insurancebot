#!/usr/bin/env node

/**
 * 直接测试 OpenRouter API
 */

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

if (!apiKey) {
  console.error('❌ OPENROUTER_API_KEY 未设置');
  process.exit(1);
}

console.log('🧪 测试 OpenRouter API');
console.log('================================');
console.log(`API Key: ${apiKey.substring(0, 20)}...`);
console.log(`Model: ${model}`);
console.log('');

async function test() {
  try {
    console.log('📤 发送请求...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'InsureMate Pro',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: '你好，请回答"叉车"是什么职业？',
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ 失败！');
      console.error('');
      console.error('错误信息:');
      console.error({
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      return;
    }

    const data = await response.json();
    console.log('✅ 成功！');
    console.log('');
    console.log('📝 响应:');
    console.log(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ 失败！');
    console.error('');
    console.error('错误信息:');
    console.error(error.message);
  }
}

test();
