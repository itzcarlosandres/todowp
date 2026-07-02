<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>TodoWP — Sitemap</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:system-ui,sans-serif;background:#0b0f19;color:#e2e8f0;padding:2rem}
          .wrap{max-width:1100px;margin:0 auto}
          h1{font-size:1.5rem;font-weight:800;margin-bottom:.25rem}
          h1 span{color:#6366f1}
          .sub{color:#64748b;font-size:.85rem;margin-bottom:2rem}
          table{width:100%;border-collapse:collapse;font-size:.85rem}
          th{text-align:left;padding:.6rem .8rem;background:#131826;color:#94a3b8;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #1e293b}
          td{padding:.5rem .8rem;border-bottom:1px solid #1e293b}
          tr:hover td{background:#111827}
          .url{font-family:monospace;font-size:.8rem;max-width:420px;word-break:break-all}
          .url a{color:#818cf8;text-decoration:none}
          .url a:hover{text-decoration:underline}
          .priority{text-align:center;font-weight:700}
          .p10{color:#22c55e}.p09{color:#4ade80}.p08{color:#facc15}.p07{color:#f59e0b}
          .p06{color:#fb923c}.p05{color:#94a3b8}.p03{color:#64748b}
          .freq{color:#64748b;font-size:.75rem}
          .section{margin-bottom:2.5rem}
          .section h2{font-size:.9rem;font-weight:700;color:#6366f1;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid #1e293b}
          .badge{display:inline-block;padding:.1em .5em;border-radius:4px;font-size:.7rem;font-weight:600;margin-left:.5rem}
          .badge-featured{background:rgba(99,102,241,.15);color:#a5b4fc}
          .badge-legal{background:rgba(100,116,139,.15);color:#94a3b8}
          .stats{margin-bottom:2rem;display:flex;gap:1rem;flex-wrap:wrap}
          .stat{background:#131826;border:1px solid #1e293b;border-radius:8px;padding:.8rem 1.2rem}
          .stat .num{font-size:1.4rem;font-weight:800;color:#6366f1}
          .stat .label{font-size:.7rem;color:#64748b;text-transform:uppercase}
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1><span>TodoWP</span> · Sitemap XML</h1>
          <p class="sub">Índice completo de páginas del sitio</p>

          <div class="stats">
            <xsl:variable name="total" select="count(sitemap:urlset/sitemap:url)"/>
            <div class="stat"><div class="num"><xsl:value-of select="$total"/></div><div class="label">Páginas totales</div></div>
            <div class="stat"><div class="num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/product/')])"/></div><div class="label">Productos</div></div>
            <div class="stat"><div class="num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/blog/')])"/></div><div class="label">Blog posts</div></div>
            <div class="stat"><div class="num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/products?category=')])"/></div><div class="label">Categorías</div></div>
          </div>

          <xsl:call-template name="section">
            <xsl:with-param name="title" select="'Páginas principales'"/>
            <xsl:with-param name="filter" select="sitemap:urlset/sitemap:url[not(contains(sitemap:loc,'/product/')) and not(contains(sitemap:loc,'/blog/')) and not(contains(sitemap:loc,'?category='))]"/>
          </xsl:call-template>

          <xsl:call-template name="section">
            <xsl:with-param name="title" select="'Productos'"/>
            <xsl:with-param name="filter" select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'/product/')]"/>
          </xsl:call-template>

          <xsl:call-template name="section">
            <xsl:with-param name="title" select="'Categorías'"/>
            <xsl:with-param name="filter" select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'?category=')]"/>
          </xsl:call-template>

          <xsl:call-template name="section">
            <xsl:with-param name="title" select="'Blog'"/>
            <xsl:with-param name="filter" select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'/blog/')]"/>
          </xsl:call-template>
        </div>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="section">
    <xsl:param name="title"/>
    <xsl:param name="filter"/>
    <xsl:if test="$filter">
      <div class="section">
        <h2><xsl:value-of select="$title"/> <span class="badge"><xsl:value-of select="count($filter)"/></span></h2>
        <table>
          <tr>
            <th>URL</th>
            <th>Última modificación</th>
            <th style="width:80px">Frecuencia</th>
            <th style="width:60px">Prioridad</th>
          </tr>
          <xsl:for-each select="$filter">
            <xsl:sort select="number(sitemap:priority)" order="descending"/>
            <tr>
              <td class="url">
                <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
              </td>
              <td class="freq"><xsl:value-of select="substring(sitemap:lastmod,1,10)"/></td>
              <td class="freq"><xsl:value-of select="sitemap:changefreq"/></td>
              <td class="priority">
                <xsl:variable name="p" select="number(sitemap:priority)"/>
                <xsl:choose>
                  <xsl:when test="$p >= 1"><span class="p10"><xsl:value-of select="$p"/></span></xsl:when>
                  <xsl:when test="$p >= 0.9"><span class="p09"><xsl:value-of select="$p"/></span></xsl:when>
                  <xsl:when test="$p >= 0.8"><span class="p08"><xsl:value-of select="$p"/></span></xsl:when>
                  <xsl:when test="$p >= 0.7"><span class="p07"><xsl:value-of select="$p"/></span></xsl:when>
                  <xsl:when test="$p >= 0.6"><span class="p06"><xsl:value-of select="$p"/></span></xsl:when>
                  <xsl:when test="$p >= 0.5"><span class="p05"><xsl:value-of select="$p"/></span></xsl:when>
                  <xsl:otherwise><span class="p03"><xsl:value-of select="$p"/></span></xsl:otherwise>
                </xsl:choose>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </div>
    </xsl:if>
  </xsl:template>
</xsl:stylesheet>
