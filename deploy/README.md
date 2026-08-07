# Deploying

The site is static. GitHub Actions builds it and rsyncs the output to
`/var/www/orrin` on the VPS; nginx serves that directory. Nothing runs on the
server — no Node, no process to restart, no database.

- Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- nginx config: [`nginx/orrinengine.com.conf`](nginx/orrinengine.com.conf)

Every push to `main` deploys. You can also re-run by hand from the repo's
Actions tab (`workflow_dispatch`).

## One-time server setup

Run as root on the VPS.

### 1. Deploy user and web root

```bash
adduser --disabled-password --gecos "" deploy
mkdir -p /var/www/orrin /home/deploy/.ssh
chown -R deploy:deploy /var/www/orrin /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

### 2. Key pair for GitHub Actions

**Generate on your local machine, not the server.** The private key's only two
destinations are your disk and the GitHub secret — it should never be copied
off a box, pasted into a chat window, or sent over anything.

On your machine:

```bash
ssh-keygen -t ed25519 -N "" -C "github-actions-orrin" -f ~/.ssh/orrin_deploy
cat ~/.ssh/orrin_deploy.pub
```

That prints the **public** half — one line starting `ssh-ed25519`. Public keys
are safe to paste anywhere; that's what they're for.

On the server, substituting that line:

```bash
printf 'command="/usr/bin/rrsync -wo /var/www/orrin",restrict %s\n' \
  'ssh-ed25519 AAAA...PASTE_PUBLIC_KEY_HERE... github-actions-orrin' \
  > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
```

`-wo` is write-only: the key can push files but not read the directory back.
`restrict` disables pty allocation, port forwarding, agent forwarding and X11.
So even if the private key leaked, it grants writing into one directory —
not a shell, not a tunnel, not the rest of the machine.

### 3. nginx

```bash
cp deploy/nginx/orrinengine.com.conf /etc/nginx/sites-available/orrinengine.com
ln -s /etc/nginx/sites-available/orrinengine.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

`nginx -t` first, always — a bad config plus a reload takes every site on the
box down, not just this one.

### 4. Certificate

DNS must already resolve to this server or issuance fails.

```bash
certbot --nginx -d orrinengine.com -d www.orrinengine.com
```

certbot edits the config in place to add the TLS listener and an HTTP→HTTPS
redirect. Renewal is automatic via its systemd timer.

## GitHub configuration

One variable, four secrets. `SITE_URL` is a *variable* rather than a secret
because it is public and it is useful to see it in the build log.

| Name | Kind | Value |
| --- | --- | --- |
| `SITE_URL` | variable | `https://orrinengine.com` |
| `SSH_PRIVATE_KEY` | secret | `~/.ssh/orrin_deploy` from step 2 |
| `SSH_KNOWN_HOSTS` | secret | output of `ssh-keyscan -t ed25519 <VPS_IP>` |
| `DEPLOY_HOST` | secret | the VPS IP or hostname |
| `DEPLOY_USER` | secret | `deploy` |

Set them from your machine. `gh` reads the key from the file and sends it
straight to GitHub's API — it never lands in your shell history, your
clipboard, or a browser field:

```bash
gh secret set SSH_PRIVATE_KEY -R Orrin-Team/website < ~/.ssh/orrin_deploy
gh secret set SSH_KNOWN_HOSTS -R Orrin-Team/website -b "$(ssh-keyscan -t ed25519 <VPS_IP> 2>/dev/null)"
gh secret set DEPLOY_HOST      -R Orrin-Team/website -b "<VPS_IP>"
gh secret set DEPLOY_USER      -R Orrin-Team/website -b "deploy"
```

Note the `<` redirect on the first one rather than `-b`. Passing a key as a
command-line argument would put it in your shell history and in the process
list; reading from the file avoids both.

Keep `~/.ssh/orrin_deploy` on your machine — it's the only copy, and you'll
need it to rotate or re-add the secret. GitHub won't show it back to you.

`SSH_KNOWN_HOSTS` pins the server's host key. Without it the workflow would
accept whatever host answers, so a hijacked DNS record could be handed the
deploy key. With it, the connection fails instead.

## Rotating the deploy key

If the key is ever exposed, it grants write access to the web root — enough to
deface the site, not to run anything. To rotate: repeat step 2 with a new
filename, overwrite `authorized_keys`, and update the `SSH_PRIVATE_KEY` secret.

## Troubleshooting

**Workflow fails at Build with a `SITE_URL` error** — the repository variable
is missing. That guard exists so the failure names itself instead of silently
shipping `localhost` canonical URLs.

**Workflow fails at Deploy with `Host key verification failed`** — the
`SSH_KNOWN_HOSTS` secret is missing or the server's key changed. Re-run
`ssh-keyscan` and update it.

**Workflow fails at Deploy with `rrsync: ... refused`** — the rsync flags don't
match what `rrsync` allows, or the path escapes the confined root. The remote
target must be `./`, not an absolute path.

**Site serves someone else's content** — nginx fell through to a
`default_server` block because ours didn't match. Check `nginx -T | grep -A2
server_name` and confirm `orrinengine.com` appears.

**A deploy succeeded but the page looks stale** — hard-refresh. HTML is sent
`must-revalidate`, but a browser that already has it may still show the old
copy until it revalidates.
