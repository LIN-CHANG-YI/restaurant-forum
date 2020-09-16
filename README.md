# 餐廳論壇
### 網站功能
+ 管理員可以登入後台新增/修改/刪除餐廳資料
+ 管理員可以登入後台新增/修改/刪除餐廳分類
+ 管理員可以登入後台修改使用者權限
+ root@example.com為權限最高使用者，故無法被修改
+ 使用者可以修改個人簡介
+ 使用者可以查看其他使用者個人簡介
+ 使用者可以追蹤其他使用者
+ 個人簡介包含:評論餐廳、收藏餐廳、追蹤的使用者、追蹤自己的使用者
+ 使用者可以篩選餐廳分類
+ 使用者可以加入/移除最愛餐廳至收藏清單
+ 使用者可以Like/Unlike餐廳
+ 使用者可以評論餐廳
+ 使用者可以查看最新動態資訊
+ 使用者可以點選Top10人氣餐廳查看收藏數高的餐廳
+ 使用者可以點選美食達人查看追蹤人數高的使用者
### 測試帳號
| 帳號 | 密碼 |
| :------:| :-----------:|
| root@example.com | 12345678 |
| user1@example.com | 12345678 |
| user2@example.com | 12345678 |
### 專案畫面
![](https://upload.cc/i1/2020/09/08/Dz5lMS.png)

![](https://upload.cc/i1/2020/09/08/Ynues7.png)

![](https://upload.cc/i1/2020/09/08/LElT7w.png)
### 安裝方式
1.打開 terminal 將專案 clone 到本地電腦
```
git clone https://github.com/taylorchen78/expense-tracker.git
```
2.進入專案資料夾
```
cd expense-tracker
```
3.安裝npm
```
npm install
```
4.安裝nodemon
```
npm install nodemon
```
5.Workbench新增database
```
CREATE DATABASE forum;
```
6.Workbench使用database
```
use forum;
```
7.匯入遷徙檔案
```
npx sequelize db:migrate
```
8.匯入種子資料
```
npx sequelize db:seed:all
```
9.啟動程式
```
npm run start
或
npm run dev
```
10.成功執行
```
在 terminal 可以看到 Example app listening on port 3000!
```
11.開啟瀏覽器
```
網址列輸入localhost:3000
```
### 開發環境
+ Node.js: v10.15.0
+ Express: v4.17.1
+ Express-Handlebars: v5.1.0
+ mysql2: v2.1.0
+ sequelize: v6.3.5
+ sequelize-cli: v6.2.0
### 專案開發人員
[LIN-CHANG-YI](https://github.com/LIN-CHANG-YI)
