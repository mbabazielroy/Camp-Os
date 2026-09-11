#!/usr/bin/env node
/**
 * Prints the address to open the app on a phone, plus a QR code for it.
 * Scan it with the phone's camera - no Expo, no app install.
 *
 *   npm run phone
 */
import os from 'node:os';
import net from 'node:net';
import qrcode from 'qrcode-terminal';

const PORT = Number(process.env.PORT ?? 3000);

function lanAddresses() {
  const found = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      // 169.254.x.x means the interface never got a real address.
      if (addr.address.startsWith('169.254.')) continue;
      found.push({ name, address: addr.address });
    }
  }
  // Prefer everyday home/office ranges over virtual adapters (Docker, WSL, VPN).
  const rank = ({ name, address }) => {
    if (/vEthernet|WSL|Docker|VirtualBox|VMware|Hyper-V|utun|tun\d/i.test(name)) return 2;
    if (address.startsWith('192.168.') || address.startsWith('10.')) return 0;
    return 1;
  };
  return found.sort((a, b) => rank(a) - rank(b));
}

function isPortOpen(host, port, timeout = 1200) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeout);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

const interfaces = lanAddresses();

if (interfaces.length === 0) {
  console.log('\nNo network connection found. Connect this computer to Wi-Fi and try again.\n');
  process.exit(1);
}

const primary = interfaces[0];
const url = `http://${primary.address}:${PORT}`;
const serverUp = await isPortOpen(primary.address, PORT);

console.log('\n  Mill Stream Camp Office - open on your phone\n');
qrcode.generate(url, { small: true });
console.log(`  ${url}\n`);

if (serverUp) {
  console.log('  The dev server is running. Scan the code with your phone camera.');
  console.log('  Tip: in the browser menu choose "Add to Home Screen" for the app feel.\n');
} else {
  console.log(`  Nothing is listening on port ${PORT} yet.`);
  console.log('  Open a second terminal and run:  npm run dev:lan\n');
}

if (interfaces.length > 1) {
  console.log('  Other addresses on this computer (try these if the first one fails):');
  for (const iface of interfaces.slice(1)) {
    console.log(`    http://${iface.address}:${PORT}   (${iface.name})`);
  }
  console.log('');
}

if (process.platform === 'win32') {
  console.log('  If the phone cannot reach it, Windows Firewall is the usual cause.');
  console.log('  Run once in an ADMIN Command Prompt:');
  console.log(
    `    netsh advfirewall firewall add rule name="Next dev ${PORT}" dir=in action=allow protocol=TCP localport=${PORT}\n`
  );
}

console.log('  Phone and computer must be on the same Wi-Fi network.\n');
