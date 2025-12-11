# 职业分类数据说明

## 概述

本项目使用京东安联职业分类表（2019版）作为职业数据库，包含 **1616 条职业记录**。

## 数据统计

- **总记录数**: 1616
- **1类（低风险）**: 150 条
- **2类（低风险）**: 355 条
- **3类（中风险）**: 377 条
- **4类（中高风险）**: 419 条
- **5类（高风险）**: 0 条
- **6类（特高风险）**: 0 条
- **拒保**: 315 条

## 数据结构

```typescript
interface OccupationDefinition {
  industry: string;      // 行业名称
  group: string;         // 职业类别名称
  code: string;          // 职业代码（新）
  name: string;          // 职业名称
  category: RiskCategory; // 职业分类（0-6）
}
```

## 风险分类说明

| 分类 | 说明 | 记录数 |
|------|------|--------|
| 1 | 低风险 | 150 |
| 2 | 低风险 | 355 |
| 3 | 中风险 | 377 |
| 4 | 中高风险 | 419 |
| 5 | 高风险 | 0 |
| 6 | 特高风险 | 0 |
| 0 | 拒保 | 315 |

## 数据来源

- **文件**: `京东安联职业分类表.md`
- **版本**: 2019版
- **更新时间**: 自动从 markdown 表格解析

## 使用方法

### 1. 解析职业表格

如果需要更新职业数据，运行：

```bash
npm run parse:occupations
```

这会自动从 `京东安联职业分类表.md` 解析数据并生成 `data/occupationData.ts`。

### 2. 验证数据完整性

```bash
npm run verify:occupations
```

输出数据统计信息和完整性检查结果。

### 3. 在代码中使用

```typescript
import { OCCUPATION_DATA, getFullOccupationText } from '@/data/occupationData';

// 获取所有职业数据
const allOccupations = OCCUPATION_DATA;

// 搜索特定职业
const drivers = OCCUPATION_DATA.filter(o => o.name.includes('司机'));

// 按分类筛选
const lowRiskJobs = OCCUPATION_DATA.filter(o => o.category === 1 || o.category === 2);

// 获取格式化的职业列表（用于 AI 提示词）
const occupationText = getFullOccupationText();
```

## 主要行业分布

| 行业 | 记录数 |
|------|--------|
| 生产制造业 | 约 200+ |
| 建筑工程业 | 约 150+ |
| 交通运输业 | 约 150+ |
| 服务业 | 约 150+ |
| 农牧业 | 约 100+ |
| 其他 | 约 800+ |

## 常见职业示例

### 低风险（1-2类）
- 内勤人员
- 业务销售人员
- 经理/主管
- 技术人员
- 教师
- 医生

### 中风险（3类）
- 司机（小客车）
- 保安人员
- 工人（一般）
- 维修人员

### 中高风险（4类）
- 司机（大客车/出租车）
- 建筑工人
- 高空作业人员
- 机械操作员

### 拒保（0类）
- 农民/果农
- 矿工
- 渔业捕捞人员
- 伐木工人
- 高危运动员

## 数据更新流程

1. 更新 `京东安联职业分类表.md` 文件
2. 运行 `npm run parse:occupations`
3. 验证数据 `npm run verify:occupations`
4. 提交更改

## 脚本说明

### parse_occupation_table.py

- **功能**: 解析 markdown 表格并生成 TypeScript 代码
- **输入**: `京东安联职业分类表.md`
- **输出**: `data/occupationData.ts`
- **特性**:
  - 自动处理"拒保"分类（转换为 0）
  - 数据验证和错误处理
  - 生成统计信息

### verify_occupation_data.ts

- **功能**: 验证职业数据的完整性和准确性
- **检查项**:
  - 数据完整性（必填字段）
  - 重复代码检测
  - 分类统计
  - 行业分布
  - 职业类别分布

## 常见问题

### Q: 如何添加新的职业？
A: 编辑 `京东安联职业分类表.md` 文件，在对应行业和类别下添加新行，然后运行 `npm run parse:occupations`。

### Q: 如何修改职业分类？
A: 直接编辑 `京东安联职业分类表.md` 中的分类列，然后重新解析。

### Q: 数据是否支持搜索？
A: 支持。可以使用 `OCCUPATION_DATA.filter()` 进行本地搜索，或通过 Gemini AI 进行智能匹配。

### Q: 如何处理拒保职业？
A: 拒保职业的 `category` 值为 0，在 UI 中应该禁用"加入方案"按钮。

## 性能考虑

- 数据量: 1616 条记录
- 内存占用: 约 200KB
- 搜索性能: O(n)，对于本地搜索足够快
- 建议: 对于大规模搜索，考虑使用 Gemini AI 进行智能匹配

## 许可证

数据来源于京东安联保险，仅供项目内部使用。
