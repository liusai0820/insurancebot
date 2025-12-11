import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * 直接代理 Gemini API 请求
 * 支持通过 HTTP_PROXY/HTTPS_PROXY 环境变量转发请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // 构建 Gemini API URL
    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    // 配置 axios 实例
    const axiosConfig: any = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // 在 Node.js 中，HTTP_PROXY 和 HTTPS_PROXY 环境变量会被自动使用
    // 如果需要显式配置，可以在这里添加
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      try {
        const HttpProxyAgent = require('http-proxy-agent');
        const HttpsProxyAgent = require('https-proxy-agent');

        if (process.env.HTTP_PROXY) {
          axiosConfig.httpAgent = new HttpProxyAgent.HttpProxyAgent(process.env.HTTP_PROXY);
        }
        if (process.env.HTTPS_PROXY) {
          axiosConfig.httpsAgent = new HttpsProxyAgent.HttpsProxyAgent(process.env.HTTPS_PROXY);
        }
      } catch (e) {
        console.warn('Proxy agents not available, using default');
      }
    }

    // 转发请求到 Gemini API
    const response = await axios.post(
      `${geminiUrl}?key=${apiKey}`,
      body,
      axiosConfig
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Gemini Proxy Error:', error.message);

    return NextResponse.json(
      {
        error: 'Failed to proxy request to Gemini API',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
