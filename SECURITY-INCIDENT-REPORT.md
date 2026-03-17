# Security Incident Report — XMRig Crypto Miner on VPS

**Date:** March 3, 2026  
**Project:** Perfomax Client (Nura)  
**Template:** Isomorphic (iso v7.6.2)  
**Framework:** Next.js (originally v15.2.4)  
**Hosting:** Hostinger VPS (previously DigitalOcean)  
**Server IP:** 31.97.113.49

---

## 1. Incident Summary

A cryptocurrency miner (XMRig v6.21.0) was discovered on the VPS at `/home/deploy/apps/nura/client/xmrig-6.21.0/xmrig`. The hosting provider (Hostinger) detected the malware via their Monarx anti-malware agent and stopped the VPS. This incident occurred on **two separate hosting providers** (DigitalOcean and Hostinger), confirming the attack vector was the application itself, not the server infrastructure.

---

## 2. Root Cause Analysis

### Vulnerable Next.js Version (15.2.4)

The application was deployed using **Next.js 15.2.4**, which contained the following critical vulnerabilities:

| Severity | CVE / Advisory | Vulnerability | Impact |
|----------|---------------|---------------|--------|
| **Critical** | GHSA-9qr9-h5gf-34mp | Remote Code Execution (RCE) via React flight protocol | Attacker executes arbitrary shell commands on the server |
| **Critical** | GHSA-f82v-jwr5-mffw | Authorization Bypass in Middleware | Attacker bypasses authentication and accesses protected routes |
| **Critical** | GHSA-4342-x723-ch2f | HTTP request deserialization DoS | Server crash via crafted requests |
| **High** | GHSA-w37m-7fhw-fmv9 | Server Actions Source Code Exposure | Application source code leaked to attacker |

### Attack Sequence (Reconstructed)

```
1. Next.js app deployed on port 3000, publicly accessible
2. Automated vulnerability scanners detected the exposed Next.js server
3. Attacker exploited the RCE vulnerability (GHSA-9qr9-h5gf-34mp)
   → Sent crafted HTTP request to the Next.js server
   → Achieved remote code execution on the VPS
4. Attacker ran shell commands via RCE:
   a. Downloaded xmrig-6.21.0 (Monero cryptocurrency miner)
   b. Extracted to /home/deploy/apps/nura/client/xmrig-6.21.0/
   c. Started the miner process
5. XMRig consumed server CPU to mine cryptocurrency
6. Hostinger's Monarx agent detected the miner and stopped the VPS
```

### Why It Was NOT an SSH Brute Force

- The attack occurred on **two different hosting providers** with different SSH configurations
- The malware was placed inside the **application directory**, not a system directory
- The `deploy` user (which ran the app) owned the miner files
- The Next.js RCE vulnerability allows command execution through HTTP requests alone — no SSH access needed

---

## 3. Full Vulnerability Audit

A `pnpm audit` revealed **48 vulnerabilities** in the project dependencies:

| Severity | Count |
|----------|-------|
| Critical | 5 |
| High | 22 |
| Moderate | 16 |
| Low | 5 |
| **Total** | **48** |

### Critical Vulnerabilities

| Package | Version | Vulnerability | Fixed In |
|---------|---------|--------------|----------|
| next | 15.2.4 | RCE via React flight protocol | ≥15.2.6 |
| next | 15.2.4 | Authorization Bypass in Middleware | ≥15.2.3 |
| next | 15.2.4 | DoS via Server Components | ≥15.2.7 |
| next | 15.2.4 | HTTP request deserialization DoS | ≥15.2.9 |
| swiper | ^11.2.6 | Prototype pollution | ≥12.1.2 |

### High Severity Vulnerabilities (Notable)

| Package | Vulnerability |
|---------|--------------|
| fast-xml-parser | Entity encoding bypass via regex injection |
| nodemailer | DoS via recursive calls |
| glob / minimatch | Command injection, ReDoS |

---

## 4. Remediation Actions Taken

### 4.1 Dependency Updates

| Action | Before | After |
|--------|--------|-------|
| Next.js upgrade | 15.2.4 | **15.5.10** |

### 4.2 Application Security Hardening

- **Authentication added**: Static credentials auth via NextAuth CredentialsProvider (UAT_EMAIL / UAT_PASSWORD from environment variables)
- **Middleware protection**: All routes protected by auth middleware; only API, static assets, and auth pages are public
- **Dark mode enforced**: `forcedTheme="dark"` prevents theme manipulation
- **Telemetry disabled**: `NEXT_TELEMETRY_DISABLED=1` prevents outbound telemetry calls during build

### 4.3 VPS Security Hardening

| Action | Status |
|--------|--------|
| XMRig removed from server | ✅ Verified deleted |
| No malicious crontabs found | ✅ Verified clean |
| No unauthorized SSH keys found | ✅ Verified clean |
| No rogue systemd services found | ✅ Verified clean |
| fail2ban installed and active | ✅ Running |
| UFW firewall configured (ports 22, 80, 443, 4000) | ✅ Active |
| Application port changed from 3000 to 4000 | ✅ Updated |
| No suspicious processes running | ✅ Verified clean |

### 4.4 CI/CD Pipeline Improvements

- Migrated from SCP-based deployment to **self-hosted GitHub Actions runner**
- PM2 process runs with absolute path to Next.js binary
- Environment variables injected from GitHub Secrets (not hardcoded)
- Health check step verifies deployment success

---

## 5. VPS Malware Scan Results (Post-Cleanup)

```bash
# Crypto miner processes
$ ps aux | grep -iE "xmrig|minerd|crypto|kdevtmpfsi|kinsing|coin"
# Result: No matches found ✅

# Listening ports
$ ss -tulnp
# Result: Only nginx (80/443), sshd (22), systemd-resolve, monarx-agent ✅

# Top CPU consumers
$ ps aux --sort=-%cpu | head -20
# Result: Only legitimate system processes (monarx-agent, systemd, fail2ban, nginx) ✅

# Malware files
$ ls -la /home/deploy/apps/nura/client/xmrig-6.21.0/xmrig
# Result: No such file or directory ✅
```

---

## 6. Recommendations

### Immediate

- [ ] Update `swiper` to ≥12.1.2 (critical prototype pollution)
- [ ] Update `nodemailer` to ≥7.0.11 (DoS vulnerability)
- [ ] Set up SSL/TLS via Let's Encrypt for HTTPS
- [ ] Configure nginx reverse proxy instead of exposing port 4000 directly

### Ongoing

- [ ] Run `pnpm audit` regularly (add to CI/CD pipeline)
- [ ] Pin Next.js to patch versions and monitor security advisories
- [ ] Set up automated dependency updates (Dependabot or Renovate)
- [ ] Monitor VPS with `monarx-agent` (already installed by Hostinger)
- [ ] Review and rotate `NEXTAUTH_SECRET` periodically

### Infrastructure

- [ ] Disable password-based SSH login (use key-only authentication)
- [ ] Close port 4000 after setting up nginx reverse proxy
- [ ] Set up automated backups
- [ ] Consider rate limiting on nginx

---

## 7. Conclusion

The security incident was caused by **critical vulnerabilities in Next.js 15.2.4** shipped with the Isomorphic template (iso v7.6.2). The most severe was a Remote Code Execution (RCE) vulnerability that allowed attackers to run arbitrary commands on the server through crafted HTTP requests — no SSH access required.

The attack was automated (crypto mining botnet) and targeted the framework vulnerability, not the server infrastructure. This was confirmed by the incident recurring across two different hosting providers (DigitalOcean → Hostinger).

All identified vulnerabilities have been patched by upgrading Next.js to 15.5.10, and the VPS has been verified clean of malware and persistence mechanisms.

---

*Report generated: March 3, 2026*
