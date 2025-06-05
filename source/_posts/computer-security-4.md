---
title: computer-security-4
date: 2025-05-25 22:58:12
tags:
cover: https://bu.dusays.com/2025/06/05/6840f45578993.png
---

### **摘要**

本实验报告详述了通过模拟计算机病毒行为，分析其感染、传播及持久化机制的过程。实验利用虚拟化环境，通过创建VBScript脚本病毒和Word宏病毒样本，并结合Process Monitor及Regshot等专业分析工具，观察病毒对系统文件和注册表的修改。实验结果直观地展示了病毒的自我复制、创建恶意文件以及通过注册表和启动文件夹实现持久化驻留的技术手段，强调了实时监控与系统快照对比在病毒行为分析中的重要性。

---

### **1. 实验目的与要求**

本实验旨在通过实践操作，深入理解计算机病毒的感染、传播及行为机制。具体要求如下：

* **可视化演示**：直观地观察病毒（模拟样本）对系统的更改。
* **剖析注册表**：分析病毒为了实现持久化驻留而对注册表进行的修改。
* **比较文件变化**：对比分析“染毒”前后，文件系统和进程内存的变化。
* **捕获运行细节**：利用专业工具实时监控并记录病毒的活动，揭示其技术内幕。

---

### **2. 实验环境准备**

为了安全地进行实验，搭建了一个隔离的虚拟实验室。

**所需软件:**

* **虚拟化软件**: Oracle VirtualBox
* **操作系统镜像**: Windows 7
* **分析工具**:
    * Process Monitor (ProcMon)
    * Regshot
    * Microsoft Office 2007/2010

**搭建步骤:**

1.  **安装虚拟机**: 在物理主机上安装了VirtualBox。
2.  **创建虚拟机**: 创建了一个新的虚拟机，并安装了Windows 7操作系统。
3.  **配置网络**: 将虚拟机的网络适配器设置为 **“仅主机(Host-Only)模式”**，确保虚拟机与外部网络完全隔离。
4.  **安装工具**: 在虚拟机内部安装了Process Monitor、Regshot和Microsoft Office。
5.  **创建快照**: 在完成所有准备工作后，关闭虚拟机并为其创建了一个 **“干净的”快照 (Clean Snapshot)**。此快照作为实验的基线，每次实验结束后，均恢复到此快照，以确保环境纯净。

---

### **3. 实验内容与过程**

#### **实验一：恶意代码和脚本类病毒实验**

本实验创建了一个简单的VBScript脚本来模拟病毒的自我复制和持久化行为。

**操作流程与现象记录:**

1.  **恢复快照**: 确保虚拟机处于“干净的”快照状态。
2.  **拍摄“染毒前”快照**:
    * 启动虚拟机。
    * 打开 **Regshot** 工具。
    * 点击 `1st shot` 按钮，选择 `Shot and Save`。将快照保存为 `before.txt`。此操作记录了当前系统的注册表状态。
3.  **编写模拟病毒脚本**:
    * 在桌面上创建了一个新的文本文档。
    * 输入以下VBScript代码，并将其另存为 `virus.vbs` (确保文件类型为“所有文件”)。

    ```vbscript
    ' Simple VBScript to simulate virus behavior
    On Error Resume Next

    ' 1. Display a message to show it's running
    MsgBox "I am a simple virus!", 0, "Virus Alert"

    ' 2. Create a "malicious" file
    Dim fso, file
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set file = fso.CreateTextFile("C:\Infected.txt", True)
    file.WriteLine("This system has been infected.")
    file.Close

    ' 3. Add a registry key for persistence (auto-run on startup)
    Dim WSHShell
    Set WSHShell = WScript.CreateObject("WScript.Shell")
    ' Get the path of the current script
    Dim scriptPath
    scriptPath = WScript.ScriptFullName
    ' Add a key to HKCU\Software\Microsoft\Windows\CurrentVersion\Run
    WSHShell.RegWrite "HKCU\Software\Microsoft\Windows\CurrentVersion\Run\MyVirus", scriptPath, "REG_SZ"

    Set fso = Nothing
    Set WSHShell = Nothing
    ```

4.  **启动实时监控**:
    * 打开 **Process Monitor (ProcMon)**。
    * 设置过滤器 (Filter)，将 `Process Name` 设置为 `wscript.exe`，然后点击 `Add` 和 `OK`。
    * 点击放大镜图标开始捕获事件。
5.  **执行病毒脚本**:
    * 双击桌面上的 `virus.vbs` 文件。
    * 观察到一个消息框弹出。点击“确定”。
6.  **拍摄“染毒后”快照**:
    * 在 **Regshot** 中，点击 `2nd shot` 按钮，选择 `Shot and Save`，保存为 `after.txt`。
    * 点击 `Compare` 按钮。Regshot生成了一个HTML报告，详细列出两次快照之间的所有注册表和文件系统变化。
7.  **结果分析**:
    * **Regshot报告**:
        * 在报告中 `Keys added` 部分，观察到新的键值 `MyVirus` 被添加到了 `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` 下，其值为病毒脚本 `virus.vbs` 的完整路径。这表明病毒通过此注册表项实现了开机自启。
        * 在 `Files created` 部分，观察到 `C:\Infected.txt` 文件被创建。
    * **Process Monitor**:
        * 停止捕获事件后，分析捕获到的事件列表。观察到 `wscript.exe` 进程执行了以下关键操作：
            * `RegSetValue`: 对应写入注册表键值 `MyVirus` 的行为。
            * `CreateFile`: 对应创建 `C:\Infected.txt` 文件的行为。
            * `WriteFile`: 对应向 `C:\Infected.txt` 文件中写入内容的行为。
8.  **清理环境**: 恢复到“干净的”快照，清除了所有实验痕迹。

---

#### **实验二：WORD宏类病毒实验**

本实验创建了一个带有恶意宏的Word文档，模拟宏病毒的感染过程。

**操作流程与现象记录:**

1.  **恢复快照**: 再次确保虚拟机处于“干净的”快照状态。
2.  **配置Word安全设置**:
    * 打开Microsoft Word。
    * 进入“文件” > “选项” > “信任中心” > “信任中心设置”。
    * 在“宏设置”中，选择了 **“启用所有宏（不推荐；可能会运行有潜在危险的代码）”**。
    * **注意**: 此步骤仅为实验目的，在真实环境中具有极高风险。
3.  **拍摄“染毒前”快照**: 使用 **Regshot** 再次拍摄并保存 `before_macro.txt` 快照。
4.  **创建宏病毒文档**:
    * 在Word中，按 `Alt + F11` 打开VBA编辑器。
    * 在左侧的工程浏览器中，双击 `ThisDocument`。
    * 在代码窗口中输入以下VBA代码：

    ```vba
    ' Simple Macro Virus simulation
    Private Sub Document_Open()
        ' 1. Display a message
        MsgBox "You opened a macro-infected document!", vbCritical, "Macro Alert"

        ' 2. Drop a file to the user's startup folder for persistence
        On Error Resume Next
        Dim fso As Object
        Dim startupPath As String
        Dim filePath As String

        Set fso = CreateObject("Scripting.FileSystemObject")
        ' Get the path to the Startup folder
        startupPath = CreateObject("WScript.Shell").SpecialFolders("Startup")
        filePath = startupPath & "\harmless_script.vbs"

        ' Create a simple VBS file in the startup folder
        Dim file As Object
        Set file = fso.CreateTextFile(filePath, True)
        file.WriteLine "MsgBox ""Hello from startup!"""
        file.Close

        Set fso = Nothing
    End Sub
    ```

5.  **保存文档**:
    * 将文档保存为 **启用宏的Word文档 (`.docm`)**，命名为 `report.docm`。
    * 关闭Word。
6.  **启动实时监控**:
    * 打开 **Process Monitor (ProcMon)**。
    * 将过滤器 `Process Name` 设置为 `WINWORD.EXE`。
    * 开始捕获事件。
7.  **执行宏病毒**:
    * 双击打开 `report.docm` 文件。
    * 文档打开时，宏自动执行。观察到一个警告消息框弹出。
8.  **拍摄“染毒后”快照**:
    * 使用 **Regshot** 拍摄 `after_macro.txt` 快照，并生成对比报告。
9.  **结果分析**:
    * **Regshot报告**:
        * 查看文件系统变化部分。观察到一个名为 `harmless_script.vbs` 的文件被创建在用户的启动（Startup）文件夹中，具体路径为 `C:\Users\[YourUserName]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\`。这意味着每次用户登录时，此脚本都将被执行，从而实现了持久化。
    * **Process Monitor**:
        * 停止捕获事件后，分析 `WINWORD.EXE` 进程的活动。观察到其执行了 `CreateFile` 和 `WriteFile` 操作，路径指向了上述启动（Startup）文件夹中的 `harmless_script.vbs` 文件。这揭示了Office程序是如何被利用来在系统上放置并执行恶意文件的。
10. **清理环境**: 恢复到“干净的”快照。

---

### **4. 实验结论**

通过以上两个实验，揭示了病毒感染和传播的一些核心技术内幕：

1.  **感染机制**: 病毒通过执行脚本（如 `.vbs`）或利用应用程序的功能特性（如Word宏）来触发其恶意代码。
2.  **持久化 (Persistence)**: 病毒通过修改注册表的自启动项 (`Run` 键) 或在系统的启动文件夹中放置文件，来确保在系统重启后仍能运行，实现长期驻留。
3.  **行为特征**: 病毒的行为最终会体现为一系列可被监控的系统调用，如文件创建/修改 (`CreateFile`/`WriteFile`) 和注册表写入 (`RegSetValue`)。
4.  **可视化分析的重要性**: 工具如Process Monitor和Regshot使得能够“看穿”病毒的伪装，清晰地追踪其对系统的每一步操作，为病毒的检测和清除提供了有力的证据和分析手段。

---

### **5. 讨论与思考**

本实验成功模拟了两种常见类型的病毒行为，并利用专业工具进行了有效分析。实验结果清晰地展示了病毒利用系统机制进行自我维持和传播的途径。通过Regshot的快照对比，可以精确锁定病毒对注册表和文件系统的修改；而Process Monitor则动态捕捉了病毒执行过程中的详细操作，为理解其行为模式提供了直接证据。

在实际的病毒分析中，病毒的混淆和反分析技术会使得分析过程更具挑战性。未来的研究可以探索更高级的分析技术，例如动态沙箱分析、内存取证以及逆向工程等，以应对更为复杂的恶意软件。同时，加强操作系统自身的安全防护机制，如更严格的权限控制、行为监控和入侵检测系统，对于防范此类威胁至关重要。

---