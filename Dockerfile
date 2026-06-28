# استخدام نسخة Node.js مستقرة
FROM node:18

# تحديد المجلد اللي غادي يتحط فيه الكود فالسيرفر
WORKDIR /usr/src/app

# نسخ ملفات الـ package.json باش Railway يثبت المكتبات
COPY package*.json ./

# تثبيت المكتبات (dependencies)
RUN npm install

# نسخ جميع ملفات المشروع إلى السيرفر
COPY . .

# الأمر اللي كيشغل البوت
CMD [ "node", "main.js" ]
