---
layout: page
title: Tags
description: Browse blog posts by tag.
body_class: tags-page
hero_variant: page
hero_eyebrow: Jonathan Keslin
nav_active: blog
hero_title: Tags
hero_lede: Browse posts by topic.
content_id: tags-title
content_title_html: 'All <strong>tags</strong>'
sidebar_type: blog
---

{% if site.tags and site.tags.size > 0 %}
<div class="tag-cloud">
  {% assign tag_pairs = site.tags | sort %}
  {% for tag_pair in tag_pairs %}
  {% assign tag_name = tag_pair[0] %}
  {% assign tag_posts = tag_pair[1] %}
  <a class="tag-chip tag-chip--index" href="{{ '/tags/' | append: tag_name | slugify | append: '/' | relative_url }}">
    {{ tag_name }}
    <span>{{ tag_posts.size }}</span>
  </a>
  {% endfor %}
</div>
{% else %}
<div class="info-card">
  <h2>No tags yet</h2>
  <p>
    When posts start using tags, they’ll appear here automatically.
  </p>
</div>
{% endif %}
