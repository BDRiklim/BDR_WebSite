# BDR İklimlendirme — Web Sitesi & Yönetim Paneli

İstanbul / Küçükçekmece merkezli klima, VRF ve havalandırma firması için tek sayfalık kurumsal site + gömülü yönetim paneli.

## Özellikler
- Kurumsal tanıtım sitesi: hizmetler, çözümler, referanslar, müşteri yorumları, SSS
- İletişim formu → Supabase'e kayıt (müşteri talepleri merkezi veritabanında)
- Yönetim paneli (Supabase Auth ile korumalı): talepler, mesajlar, içerik yönetimi, WhatsApp hazır-mesaj akışı, anlık güncelleme
- SEO: LocalBusiness & FAQ JSON-LD, sitemap.xml, robots.txt, meta etiketleri

## Teknoloji
- Statik HTML / CSS / JS (framework yok)
- Supabase (PostgreSQL + Auth + Realtime)
- Vercel (deploy)

## Deploy
Vercel'e bağlanır; kök `/` isteği `bdr-iklimlendirme.html` sayfasını sunar (bkz. `vercel.json`).
Supabase bağlantısı istemci tarafında `anon` public key ile yapılır; veriler RLS politikalarıyla korunur.
