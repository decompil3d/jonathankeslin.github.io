---
layout: page
title: Talks
description: Conference talks and speaking pages from Jonathan Keslin.
body_class: talks-page
hero_variant: page
hero_eyebrow: Jonathan Keslin
nav_active: talks
hero_title: Talks
hero_lede: A small archive of big-room thoughts, slide decks, and things I probably practiced saying out loud more than once.
content_id: talks-title
content_title_html: 'Current and previous <strong>talks</strong>'
sidebar_type: talks
---

{% assign talks = site.talks | sort: "talk_date" | reverse %}
{% if talks.size > 0 %}
<div class="post-list">
  {% for talk in talks %}
  <article class="post-card post-card--link">
    <a
      class="post-card__overlay"
      href="{{ talk.url | relative_url }}"
      aria-label="{{ talk.title }}"
    ></a>
    <p class="post-meta">
      {% if talk.talk_date %}
      {{ talk.talk_date | date: "%B %-d, %Y" }}
      {% else %}
      Talk
      {% endif %} &middot; {% if talk.conference %}
      {{ talk.conference }}
      {% endif %}
    </p>
    <h2>{{ talk.title }}</h2>
    {% if talk.content_lede %}
    <p>{{ talk.content_lede }}</p>
    {% endif %}
  </article>
  {% endfor %}
</div>
{% else %}
<div class="info-card">
  <h2>No talks yet</h2>
  <p>
    Add a new markdown file under <code>_talks/</code> to create a talk page.
    It will automatically show up here.
  </p>
</div>
{% endif %}
