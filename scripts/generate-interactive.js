/**
 * 交互式路由生成器
 * 用法: node scripts/generate-interactive.js
 */

import readline from 'readline'
import mysql from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

console.log(`
╔════════════════════════════════════════════════╗
║   🚀 MySQL 表结构 → 路由代码生成器           ║
╚════════════════════════════════════════════════╝
`)

async function main() {
  try {
    // 收集数据库信息
    console.log('📋 请输入数据库连接信息:\n')
    
    const dbHost = await question('数据库地址 (localhost): ') || 'localhost'
    const dbUser = await question('用户名 (root): ') || 'root'
    const dbPassword = await question('密码: ')
    const dbName = await question('数据库名: ')
    const dbPort = await question('端口 (3306): ') || '3306'
    
    console.log('\n📡 正在连接数据库...')
    
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: parseInt(dbPort),
    })
    
    console.log('✅ 数据库连接成功!\n')
    
    // 获取所有表
    const [tables] = await connection.query(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
      [dbName]
    )
    
    console.log('📊 可用的数据表:')
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.TABLE_NAME}`)
    })
    console.log('')
    
    const tableName = await question('请输入要生成代码的表名: ')
    
    if (!tables.some(t => t.TABLE_NAME === tableName)) {
      throw new Error(`表 ${tableName} 不存在`)
    }
    
    const featureName = await question(`功能模块名称 (${tableName}): `) || tableName
    
    console.log('\n🔍 正在分析表结构...')
    
    const [columns] = await connection.query(
      `SELECT 
        COLUMN_NAME as columnName,
        COLUMN_TYPE as columnType,
        IS_NULLABLE as isNullable,
        COLUMN_KEY as columnKey,
        COLUMN_COMMENT as columnComment
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION`,
      [dbName, tableName]
    )
    
    console.log(`\n✅ 找到 ${columns.length} 个字段:`)
    columns.forEach(col => {
      const comment = col.columnComment ? ` (${col.columnComment})` : ''
      console.log(`  - ${col.columnName}: ${col.columnType}${comment}`)
    })
    
    const confirm = await question('\n确认生成代码? (y/n): ')
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 已取消')
      process.exit(0)
    }
    
    await connection.end()
    
    // 创建临时配置文件
    const tempConfig = {
      DB_CONFIG: {
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        port: parseInt(dbPort),
      },
      TABLE_NAME: tableName,
      FEATURE_NAME: featureName,
    }
    
    const configPath = path.join(__dirname, 'temp-config.json')
    await fs.writeFile(configPath, JSON.stringify(tempConfig, null, 2))
    
    console.log('\n🚀 开始生成代码...\n')
    
    // 运行主生成脚本
    const mainScript = path.join(__dirname, 'generate-route-from-db.js')
    
    // 修改主脚本以读取临时配置
    const scriptContent = await fs.readFile(mainScript, 'utf-8')
    
    if (!scriptContent.includes('temp-config.json')) {
      console.log('💡 提示: 请手动修改 generate-route-from-db.js 中的配置并运行')
      console.log(`   TABLE_NAME = '${tableName}'`)
      console.log(`   FEATURE_NAME = '${featureName}'`)
    }
    
    // 清理临时文件
    await fs.unlink(configPath).catch(() => {})
    
    console.log('\n✅ 配置收集完成!')
    console.log('\n📝 下一步操作:')
    console.log('   1. 修改 scripts/generate-route-from-db.js 中的配置')
    console.log('   2. 运行: node scripts/generate-route-from-db.js')
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message)
  } finally {
    rl.close()
  }
}

main()

