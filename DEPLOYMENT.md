# 🚀 Deployment Guide for CabBooking Pro

## Option 1: Vercel (Recommended - Easiest)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Supabase database already set up

### Steps

1. **Push to GitHub**
   ```bash
   cd /app
   git init
   git add .
   git commit -m "Initial commit: CabBooking Pro MVP"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: `./`
   
3. **Add Environment Variables**
   In Vercel project settings, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://uxxutyvtoovenbbhovhf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-123456789
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Update Deployment
```bash
git add .
git commit -m "Update message"
git push
```
Vercel automatically redeploys on push!

---

## Option 2: Railway

### Steps

1. **Push to GitHub** (same as above)

2. **Deploy to Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   
3. **Add Environment Variables**
   In Railway project settings → Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://uxxutyvtoovenbbhovhf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-123456789
   ```

4. **Configure Build**
   Railway auto-detects Next.js. No additional config needed.

5. **Deploy**
   - Railway will automatically build and deploy
   - Get your public URL from dashboard

---

## Option 3: AWS (Advanced)

### Prerequisites
- AWS account
- AWS CLI installed
- Docker installed (optional)

### Using AWS Amplify

1. **Push to GitHub**

2. **AWS Amplify**
   - Go to AWS Amplify Console
   - Click "Host web app"
   - Connect to GitHub
   - Select repository
   - Add environment variables (same as above)
   - Deploy

### Using AWS EC2 (Self-hosted)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Open ports: 22, 80, 443, 3000

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js & Yarn**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g yarn
   ```

4. **Clone and Setup**
   ```bash
   git clone YOUR_REPO_URL
   cd your-repo
   
   # Create .env.local
   nano .env.local
   # Paste environment variables
   
   yarn install
   yarn build
   ```

5. **Run with PM2**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "cabbooking" -- start
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/cabbooking
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/cabbooking /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Option 4: Docker Deployment

### Create Dockerfile

Already included at `/app/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
```

### Build and Run

```bash
# Build image
docker build -t cabbooking-pro .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://uxxutyvtoovenbbhovhf.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key" \
  -e JWT_SECRET="your_secret" \
  cabbooking-pro
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=https://uxxutyvtoovenbbhovhf.supabase.co
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
      - JWT_SECRET=your-super-secret-jwt-key
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

---

## Post-Deployment Checklist

- [ ] Database tables created in Supabase
- [ ] Environment variables configured
- [ ] Application builds successfully
- [ ] Can access the deployed URL
- [ ] Can register new users
- [ ] Can login successfully
- [ ] Company can create bookings
- [ ] Vendor can accept bookings
- [ ] Real-time updates working (polling)

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |

---

## Production Considerations

### Security
1. **Change JWT_SECRET**: Use a strong random string
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Enable HTTPS**: Use SSL certificates (Let's Encrypt)

3. **Rate Limiting**: Add rate limiting middleware

4. **CORS**: Configure proper CORS in production

### Performance
1. **CDN**: Use Vercel's built-in CDN or CloudFlare
2. **Caching**: Implement Redis for session caching
3. **Database**: Optimize Supabase connection pooling
4. **Images**: Use Next.js Image optimization

### Monitoring
1. **Vercel Analytics**: Built-in for Vercel deployments
2. **Sentry**: For error tracking
3. **LogRocket**: For session replay
4. **Uptime Monitoring**: UptimeRobot or Pingdom

### Backup
1. **Supabase**: Enable daily backups
2. **Code**: Keep GitHub repository updated
3. **Database**: Regular SQL exports

---

## Scaling Considerations

### When to Scale

- 1000+ users: Consider caching layer
- 10,000+ bookings/day: Optimize database queries
- Multiple regions: Use CDN and edge functions

### How to Scale

1. **Database**: 
   - Add read replicas in Supabase
   - Implement connection pooling
   - Add database indexes

2. **Application**:
   - Use Vercel Edge Functions
   - Implement Redis for caching
   - Add RabbitMQ for real messaging

3. **Frontend**:
   - Enable Incremental Static Regeneration (ISR)
   - Add service workers for offline support
   - Implement virtual scrolling for large lists

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL automatically configured

### Railway
1. Go to Project → Settings → Domains
2. Add custom domain
3. Update CNAME record
4. SSL automatically configured

---

## Monitoring & Logs

### View Logs

**Vercel:**
```bash
vercel logs
```

**Railway:**
Check dashboard → Deployments → View Logs

**EC2:**
```bash
pm2 logs cabbooking
```

### Health Check Endpoint

Add to API routes:
```javascript
// /api/health
export async function GET() {
  return NextResponse.json({ status: 'healthy' });
}
```

---

## Rollback Strategy

### Vercel
- Go to Deployments
- Click on previous deployment
- Click "Promote to Production"

### Railway
- Go to Deployments
- Select previous deployment
- Click "Redeploy"

### PM2
```bash
pm2 restart cabbooking
```

---

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Check error logs
- [ ] Monthly: Database backup verification
- [ ] Monthly: Security updates (`yarn upgrade`)
- [ ] Quarterly: Performance audit
- [ ] Quarterly: User feedback review

### Emergency Contacts
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.io
- Railway Support: team@railway.app

---

**Your application is ready for production! 🎉**
