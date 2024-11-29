# Clipboard Text Processor  

This application allows users to seamlessly extract and process text from their clipboard or selected content using a customizable shortcut. It offers specific filtering for Solana addresses and dynamically replaces placeholders in user-defined URLs.  

---

## 📋 **Features**  

1. **Shortcut-Activated Copy**  
   - After pressing the configured shortcut:  
     - If text is selected, the software copies and processes the selected content.  
     - If no text is selected, the software uses the most recently copied clipboard content.  

2. **Solana Address Filtering**  
   - If the "Filter by Solana address only" option is selected:  
     - The software will identify and extract a valid Solana address from the text.  
     - **Example:**  
       Selected text:  
       ```plaintext
       Check this token DGagMywvLG3DwffZHX4eWWE6svnoJpiod3dSNBDwpump
       ```  
       Output:  
       ```plaintext
       DGagMywvLG3DwffZHX4eWWE6svnoJpiod3dSNBDwpump
       ```  

3. **Dynamic URL Processing**  
   - The user-provided URL must include the placeholder `{copiedText}`.  
   - The software will replace `{copiedText}` with the processed text.  
   - **Example:**  
     User-defined URL:  
     ```plaintext
     https://pump.fun/coin/{copiedText}
     ```  
     Processed URL:  
     ```plaintext
     https://pump.fun/coin/DGagMywvLG3DwffZHX4eWWE6svnoJpiod3dSNBDwpump
     ```  

4. **Run on Windows Startup (Optional)**  
   - If you'd like the software to start automatically when Windows boots:  
     1. Press `Windows + R` to open the **Run** dialog box.  
     2. Type `shell:startup` and press Enter. This will open the **Startup** folder.  
     3. Locate the software's executable file (`.exe`) on your computer.  
     4. Create a shortcut for the executable:  
        - Right-click the executable file → Select **Create Shortcut**.  
     5. Copy the shortcut into the **Startup** folder.  
     6. The software will now automatically launch every time Windows starts.  

---

## ⚠️ **Important Notes**  

1. **File Size**  
   - The software is larger than 100 MB due to its use of the Electron framework.  
   - Electron was chosen because I'm a web developer not desktop developer. Electron allows web developers to create desktop applications efficiently. While convenient, this framework results in larger file sizes compared to native desktop development tools.  

2. **Transparency & Responsibility**  
   - The application's source code is open and publicly available for review.  
   - Use the software at your discretion. The developer is not responsible for any losses, including hacking incidents or financial damages.  
