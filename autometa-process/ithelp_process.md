# IT Helpdesk Automation Process

根據 `help_desk_automation_dev.ts` 腳本，已將具體操作提取為以下步驟說明。這些步驟可以直接作為 Skill 的 Instructions 提供給 Agent。

## 角色與目標
**Role**: IT Helpdesk 自動化處理代理
**Goal**: 自動處理 IT Helpdesk 系統中的軟體安裝與卸載工單。

## 核心流程

### 登入與進入列表 (前置作業)
1. 前往 `https://ithelpdesk.deltaww.com/WOListView.do`。
2. 檢查是否有 SAML 登入按鈕 (例如 ID 為 `load_saml` 或 class 為 `sign-saml`)。如果有，點擊並等待登入完成。
3. 在工單列表中，找到第一筆工單的連結（通常在 **Subject** 欄位，含有 `data-spa-page="requests-details"` 屬性）並點擊進入詳情頁。

### 工單處理迴圈 (針對每一筆工單執行)

#### 步驟 0: 檢查狀態
1. 檢查頁面上的狀態欄位（通常是 `Close` 或 `Open` 等）。
2. 如果狀態已經是 **"Closed"**，則直接跳到**步驟 6**。

#### 步驟 1: 判斷需求類型
1. 讀取 **Description** 和 **Subject** 欄位內容。
2. 判斷邏輯：
   - 如果內容包含 **"軟體安裝"** -> 設為 **Install** 類型。
   - 如果內容包含 **"軟體卸載"** -> 設為 **Uninstall** 類型。
   - 如果兩者皆非，則跳過此工單，前往**步驟 6**。

#### 步驟 2: 切換至 Resolution 分頁
1. 找到並點擊 **"Resolution"** 分頁標籤 (通常在 Details 標籤旁)。

#### 步驟 3: 修改狀態為 Closed
1. 點擊狀態下拉選單或 **"Actions"** 按鈕。
2. 在選單中選擇 **"Closed"**。

#### 步驟 4: 填寫表單資訊
1. **ComputerName**: 檢查欄位，如果為空值，填入 `NA`。
2. **Software Brand**:
   - 點擊下拉選單，搜尋並選擇 `IBM`。
3. **Software Name**:
   - 點擊下拉選單，搜尋並選擇 `IBM Rational Engineering Lifecycle Management`。
4. **Resolution** (富文本編輯器):
   - 根據需求類型填入對應範本：

   **Install (安裝):**
   ```text
   帳號已開通
   網址: https://scp.deltaww.com/ccm/web
   有開發及程式碼版控需求才需下載安裝
   IBM_Engineering_Workflow_Management_Client
   https://scptest.deltaww.com/source/rational/rtc_client/EWM-Client-Win64-7.0.1SR1.zip

   Rational相關說明:
   https://idelta.deltaww.com/corp/SECD/Software%20Development%20Environment/Software%20Development%20Enviroment_7.0.1.aspx
   
   Account has been activated.
   Download and install only if there are development and code version control requirements.
   IBM_Engineering_Workflow_Management_Client
   https://scptest.deltaww.com/source/rational/rtc_client/EWM-Client-Win64-7.0.1SR1.zip

   Rational information.
   https://idelta.deltaww.com/corp/SECD/Software%20Development%20Environment/Software%20Development%20Enviroment_7.0.1.aspx
   ```

   **Uninstall (卸載):**
   ```text
   軟體需自行移除
   License授權環境變數請務必移除避免疑慮
   控制台 > 系統 > 進階系統設定 > 環境變數 > 移除TELELOGIC_LICENSE_FILE環境變數
   ```

#### 步驟 5: 提交變更
依序點擊以下按鈕（如果存在）：
1. **"Next"** 或 **"Update"** 按鈕。
2. **"Close Request"** 按鈕 (在彈窗中)。
3. **"Save"** 按鈕。

#### 步驟 6: 下一筆工單
1. 尋找頁面上的 **"Next"** 導航按鈕 (通常是 `>` 圖示或 ID 為 `nav_next`)。
2. **如果按鈕存在且未禁用**：點擊它以進入下一筆工單，並重複執行「工單處理迴圈」。
3. **如果找不到按鈕或按鈕已禁用**：流程結束。