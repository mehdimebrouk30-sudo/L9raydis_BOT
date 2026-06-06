// darkxecutor.js - طرد جميع أعضاء المجموعة (نسخة محسنة)
const fs = require('fs');
const path = require('path');

async function darkxecutorCommand(sock, chatId, message, senderJid) {
    try {
        // التحقق من أن الأمر يستخدم في مجموعة
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات!' }, { quoted: message });
            return;
        }

        // الحصول على رقم المرسل
        let senderNumber = senderJid.split('@')[0];
        
        // التحقق من أن المرسل مشرف في المجموعة
        const groupMetadata = await sock.groupMetadata(chatId);
        const isAdmin = groupMetadata.participants.some(
            participant => participant.id.split('@')[0] === senderNumber && 
                          (participant.admin === 'admin' || participant.admin === 'superadmin')
        );
        
        // إذا لم يكن مشرف، امنع استخدام الأمر
        if (!isAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ هذا الأمر متاح فقط للمشرفين!'
            }, { quoted: message });
            return;
        }

        // ============= تغيير اسم المجموعة =============
        const newGroupName = '🔥 𝗝𝗔𝗪𝗔𝗗.𝗕𝗢𝗧 🔥منقول';
        try {
            await sock.groupUpdateSubject(chatId, newGroupName);
            console.log('✅ تم تغيير اسم المجموعة إلى:', newGroupName);
        } catch (err) {
            console.log('❌ فشل تغيير اسم المجموعة:', err);
        }

        // ============= تغيير وصف المجموعة =============
        const newGroupDescription = '🔥 𝗝𝗔𝗪𝗔𝗗.𝗕𝗢𝗧 🔥منقول';
        try {
            await sock.groupUpdateDescription(chatId, newGroupDescription);
            console.log('✅ تم تغيير وصف المجموعة إلى:', newGroupDescription);
        } catch (err) {
            console.log('❌ فشل تغيير وصف المجموعة:', err);
        }

        // ============= تغيير صورة المجموعة (اختياري) =============
        // يمكنك إضافة صورة للمجموعة إذا أردت
        /*
        const imagePath = path.join(__dirname, '../assets/jawad.jpg');
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            try {
                await sock.groupUpdatePicture(chatId, imageBuffer);
                console.log('✅ تم تغيير صورة المجموعة');
            } catch (err) {
                console.log('❌ فشل تغيير صورة المجموعة:', err);
            }
        }
        */

        // إرسال رسالة التحذير مع رابط الدعوة
        const inviteLink = 'https://chat.whatsapp.com/KYxiK7BGguFKv1YZUKXUpY';
        
        await sock.sendMessage(chatId, { 
            text: `🚀 *بدء عملية الطرد الشامل...*\n🔥 𝗝𝗔𝗪𝗔𝗗.𝗕𝗢𝗧 🔥منقول \n${inviteLink}\n📊 جاري احتساب الأعضاء...\n⏳ جاري الطرد...`
        }, { quoted: message });

        // انتظار ثانيتين
        await new Promise(resolve => setTimeout(resolve, 2000));

        // الحصول على معلومات المجموعة
        const updatedGroupMetadata = await sock.groupMetadata(chatId);
        const participants = updatedGroupMetadata.participants;
        
        // الحصول على رقم البوت
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // إزالة البوت من قائمة الطرد
        const membersToRemove = participants
            .filter(p => p.id !== botNumber)
            .map(p => p.id);
        
        if (membersToRemove.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ لا يوجد أعضاء لطردهم!' }, { quoted: message });
            return;
        }

        // إرسال رسالة بدء العملية مع العدد الفعلي
        await sock.sendMessage(chatId, { 
            text: `🚀 *بدء عملية الطرد الشامل...*\n🔥 𝗝𝗔𝗪𝗔𝗗.𝗕𝗢𝗧 🔥منقول \n${inviteLink}\n📊 عدد الأعضاء: ${membersToRemove.length}\n⏳ جاري الطرد...` 
        }, { quoted: message });

        let removedCount = 0;
        let failedCount = 0;
        
        // طرد الأعضاء
        for (const member of membersToRemove) {
            try {
                await sock.groupParticipantsUpdate(chatId, [member], 'remove');
                removedCount++;
                
                if (removedCount % 5 === 0 || removedCount === membersToRemove.length) {
                    await sock.sendMessage(chatId, { 
                        text: `⏳ تقدم الطرد... ${removedCount}/${membersToRemove.length}` 
                    });
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                failedCount++;
                console.log(`فشل طرد ${member}:`, err);
            }
        }
        
        // النتيجة النهائية
        await sock.sendMessage(chatId, { 
            text: `✅ *تم الانتهاء!*\n\n✅ تم طرد: ${removedCount} عضو\n❌ فشل: ${failedCount} عضو\n\n🔥 𝗝𝗔𝗪𝗔𝗗.𝗕𝗢𝗧 🔥منقول \n${inviteLink}\n⌛ الوقت: ${new Date().toLocaleTimeString('ar-MA')}`
        }, { quoted: message });
        
        // تسجيل العملية
        const logsDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        const logData = {
            time: new Date().toISOString(),
            groupId: chatId,
            groupName: updatedGroupMetadata.subject,
            membersRemoved: removedCount,
            membersFailed: failedCount,
            executor: senderJid,
            executorNumber: senderNumber
        };
        
        const logPath = path.join(logsDir, 'darkxecutor.json');
        let logs = [];
        if (fs.existsSync(logPath)) {
            logs = JSON.parse(fs.readFileSync(logPath));
        }
        logs.push(logData);
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
        
    } catch (error) {
        console.error('خطأ في أمر darkxecutor:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ حدث خطأ: ${error.message}` 
        }, { quoted: message });
    }
}

module.exports = darkxecutorCommand;