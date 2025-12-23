/**
 * 数据库配置示例
 * 复制此文件为 config.js 并填入你的数据库信息
 */

export const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_database',
  port: 3306,
}

export const GENERATION_CONFIG = {
  // 要生成代码的表名
  tableName: 'users',
  
  // 生成的功能模块名称（复数形式，如 users, products, orders）
  featureName: 'users',
  
  // 是否生成模拟数据
  generateMockData: true,
  
  // 生成的列数量限制（0 表示全部）
  maxColumns: 0,
}

