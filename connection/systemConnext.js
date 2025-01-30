import chalk from "chalk";
import { encryptedOwnerNumber, encryptedGroupInviteLink, iv, key } from './Jagoan project.js';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

const decrypt = (text) => {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

const ownerNumber = decrypt(encryptedOwnerNumber);
const groupInviteLink = decrypt(encryptedGroupInviteLink);

const Connecting = async ({ update, Exp, Boom, DisconnectReason, sleep, launch }) => {
    let spinner = Data.spinner;
    let i = 0;
    global.spinnerInterval = global.spinnerInterval || setInterval(() => {
        process.stdout.write(`\r${spinner[i++]}`);
        if (i === spinner.length) i = 0;
    }, 150);

    const { connection, lastDisconnect, receivedPendingNotifications } = update;
    if (receivedPendingNotifications && !Exp.authState?.creds?.myAppStateKeyId) {
        Exp.ev.flush();
    }

    connection && console.log(chalk.yellow.bold('【 CONNECTION 】') + ' -> ', chalk.cyan.bold(connection));

    if (connection == 'close') {
        let statusCode = new Boom(lastDisconnect?.error)?.output.statusCode;
        
        switch (statusCode) {
            case 405:
                console.log(`Maaf, file sesi dinonaktifkan. Silakan melakukan pemindaian ulang🙏`);
                Exp.logout();
                console.log('Menghubungkan kembali dalam 5 detik....');
                clearInterval(spinnerInterval);
                setTimeout(() => launch(), 5000);
                break;
            case 418:
                console.log("Koneksi terputus, mencoba menghubungkan kembali🔄");
                clearInterval(spinnerInterval);
                setTimeout(() => launch(), 5000);
                break;
            case DisconnectReason.connectionReplaced:
                console.log("Koneksi lain telah menggantikan, silakan tutup koneksi ini terlebih dahulu");
                clearInterval(spinnerInterval);
                process.exit();
                break;
            case 502:
            case 503:
                console.log("Terjadi kesalahan, menghubungkan kembali🔄");
                clearInterval(spinnerInterval);
                setTimeout(() => launch(), 5000);
                break;
            case 401:
                console.log(`Perangkat keluar, silakan lakukan pemindaian ulang🔄`);
                clearInterval(spinnerInterval);
                process.exit();
                break;
            case 515:
                console.log("Koneksi mencapai batas, harap muat ulang🔄");
                clearInterval(spinnerInterval);
                setTimeout(() => launch(), 5000);
                break;
            default:
                console.log("Terjadi kesalahan, menghubungkan kembali🔄");
                clearInterval(spinnerInterval);
                setTimeout(() => launch(), 5000);
        }
    }

    if (connection === 'open') {
        await sleep(5500);
        clearInterval(spinnerInterval);
        console.log('Asikk Terhubung ✔️');
        
    // Kirim pesan ke owner
await Exp.sendMessage(ownerNumber, { 
    text: "✅ *Connect nih Owner Ganteng* 🚀\n\nBot sekarang sudah aktif dan siap digunakan!  🎉" 
});


        // Auto join grup
        try {
            let response = await Exp.groupAcceptInvite(groupInviteLink.split("/").pop());
            console.log("✅", response);
        } catch (error) {
            console.error("x", error);
        }
    }
};

export { Connecting };
