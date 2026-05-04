---
layout: page
title: Blog
description: Articles, notes, and future posts from Jonathan Keslin.
body_class: blog-page
hero_variant: page
hero_eyebrow: Jonathan Keslin
nav_active: blog
hero_title: Blog
hero_lede: Notes, articles, and other things I want to share without pretending they all need to fit on a social network.
content_id: blog-title
content_title_html: 'Latest <strong>posts</strong>'
---

{% if site.posts.size > 0 %}
<div class="post-list">
  {% for post in site.posts %}
  <article class="post-card">
    <p class="post-meta">{{ post.date | date: "%B %-d, %Y" }}</p>
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    {% if post.excerpt %}
    <p>{{ post.excerpt | strip_html | truncate: 220 }}</p>
    {% endif %}
    {% include tag-links.html tags=post.tags class="tag-list--compact" %}
  </article>
  {% endfor %}
</div>
{% else %}
<div class="info-card">
  <h2>Nothing here yet</h2>
  <p>
    This is where future posts will appear once I start publishing them. For
    now, the About page and the Talks page are the best place to start.
  </p>
  <div class="actions actions--tight">
    <a class="btn" href="/about/">
      <span class="material-symbols-rounded" aria-hidden="true">person</span>
      <span class="btn-text">
        <span>Read the bio</span>
        <span class="btn-sub">Start with the About page</span>
      </span>
      <span class="material-symbols-rounded arrow" aria-hidden="true"
        >arrow_forward</span
      >
    </a>
  </div>
</div>
{% endif %}
