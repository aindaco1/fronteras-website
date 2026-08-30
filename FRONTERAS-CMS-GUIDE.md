# 🌵 Fronteras website

A comprehensive guide to managing content on the [Fronteras Micro-film Festival website](https://fronterasfilmfestival.com) using Pages CMS.

## Access Pages CMS

1. Go to [app.pagescms.org/aindaco1/fronteras-website](https://app.pagescms.org/aindaco1/fronteras-website)
2. If prompted, sign in with your account credentials (ask @Alonso Indacochea if you don't have these)
3. Click on **Films**, **Installations**, **Sponsors**, or **Posts** in the left sidebar

---

## 🎬 How to Add/Edit Films

---

### Overview

Film pages showcase the selected films for the Fronteras festival. Each page includes:

- Film title and filmmaker info
- Hero image (film still)
- Optional YouTube embed
- Optional laurel/award badge
- Artist statement and bio

---

### Step 1: Create a New Film

1. Click **Films** in the sidebar
2. Click the **+ New** button in the top right
3. You'll see a form with all the fields described below

---

### Step 2: Fill Out Basic Fields

### **Film Title**

The exact title of the film as it should appear on the site.

| ✅ Good Examples | ❌ Avoid |
| --- | --- |
| Coyote | COYOTE |
| The Darkest Place | the darkest place |
| Les Yeux (The Eyes) | Les Yeux - The Eyes (2023) |

> 💡 Tip: Don't include the year in the title — that's what the Festival Year(s) field is for.

---

### Filmmakers

Add all filmmakers associated with the film. Click **+ Add** to add multiple filmmakers.

For each filmmaker:

| Field | Description |
| --- | --- |
| **Full Name** | Their name as they want it credited |
| **Instagram Handle** | Username without the @ symbol (optional) |
| **Bio** | 2-4 sentence biography about the filmmaker (optional) |

> 💡 Tip: The bio supports rich text formatting. Use it to describe their background, artistic focus, and notable achievements.

---

### Festival Year(s)

Select which year(s) this film was selected.

- **2023** — First festival (FUSION & Currents)
- **2025** — Second festival (Paseo & Currents)
- Select multiple if the film appeared in both years

---

### Step 3: Upload Film Still

The **Film Still** is the main hero image shown at the top of the film page and in the films gallery.

### Specifications

| Property | Requirement |
| --- | --- |
| **Dimensions** | 1920px wide, landscape (16:9 preferred) |
| **File Size** | Under 500KB |
| **Format** | JPG |
| **Content** | High-quality still from the film |

### How to Upload

1. Click the **Film Still** field
2. Click **Upload** and select your image
3. The image automatically uploads to `/img/films/`

### Image Preparation Tips

- Export a compelling frame from the film
- Use JPG at 80-85% quality
- Compress with [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/) if over 500KB

---

### Step 4: Add YouTube Embed (Optional)

If the film is available on YouTube, add the video ID.

### Finding the YouTube Video ID

The video ID is the part after `v=` in the YouTube URL.

| YouTube URL | Video ID |
| --- | --- |
| `https://www.youtube.com/watch?v=CrMbsWevTAg` | `CrMbsWevTAg` |
| `https://www.youtube.com/watch?v=U6rcBOWV3h8` | `U6rcBOWV3h8` |
| `https://youtu.be/xjZNDMDGW_I` | `xjZNDMDGW_I` |

### How to Add

1. Find the **YouTube Video ID** field
2. Enter only the video ID (not the full URL)
3. The video will appear below the film still

> 💡 Tip: Leave blank if the film isn't publicly available on YouTube.

---

### Step 5: Add Laurel/Award Badge (Optional)

The **Laurel/Award Image** floats over the top-right corner of the film still.

### Available Laurels

| Award | Path |
| --- | --- |
| Best Film | `/img/films/best-film.png` |
| 2nd Best Film | `/img/films/2nd-best-film.png` |
| 3rd Best Film | `/img/films/3rd-best-film.png` |

### How to Add

1. Find the **Laurel/Award Image** field
2. Either select an existing laurel or upload a new one
3. New laurels should be PNG with transparent background

> 💡 Tip: Leave blank for films that didn't win awards.

---

### Step 6: Write the Artist Statement (Optional)

The **Artist Statement** is displayed in italics and quotes below the video/image.

| ✅ Good Examples | ❌ Avoid |
| --- | --- |
| A thoughtful 1-3 paragraph reflection on the film's themes and inspiration | Plot summary |
| Personal connection to the subject matter | Technical details about production |
| What you want viewers to take away | Very long essays |

> 💡 Tip: Use blank lines between paragraphs for multiple paragraphs.

---

### Step 7: Configure Display Options

### Nav Logo

The animated icon shown in the navigation bar. Default is **🎥 Film**.

| Option | Best For |
| --- | --- |
| 🎥 Film | Most films |
| 📺 Installation | Film/installation hybrid |
| 🌊 Wave | Thematically appropriate |

### Page Background Color

Choose a color that complements the film still.

| Color | Hex | Best For |
| --- | --- |
| Light Gray | Default | Most content |
| Light Blue | Blue-toned imagery |
| Yellow | Warm-toned imagery |
| Aqua | Cool-toned imagery |
| Dark Green | Nature themes |
| Neon Green | High contrast needs |

---

### Step 8: Save and Preview

1. Click **Save** in the top right
2. Add a commit message (e.g., "Add Coyote film page")
3. Click **Save** to commit
4. Wait 1-2 minutes for GitHub Actions to deploy
5. Visit the site to see your new film!

---

### Complete Film Example

Here's a complete film entry for reference:

```yaml
title: Coyote
authors:
  - name: Dusty Deen
    instagram: dustydeen
    bio: "Dusty Deen is an American animator and filmmaker. His vibrant creations have been featured on screens and in galleries worldwide."
image: /img/films/coyote.jpg
youtubeId: CrMbsWevTAg
laurelImage: /img/films/best-film.png
artistStatement: I've always been intrigued by the term coyote when used as slang to describe the human smugglers who lead immigrants through the Chihuahuan Desert...
navlogo: 🎥 Film
backgroundcolor: Light Gray
year:
  - "2023"
```

---

## 📺 How to Add/Edit Installations

---

### Overview

Installation pages showcase the physical art installations at the festival. Each page includes:

- Installation title and artist info
- Hero image
- Description of the installation
- Which films are screened
- Gallery of photos

---

### Step 1: Create a New Installation

1. Click **Installations** in the sidebar
2. Click the **+ New** button in the top right
3. You'll see a form with all the fields described below

---

### Step 2: Fill Out Basic Fields

### **Installation Title**

The title of the installation artwork.

| ✅ Good Examples | ❌ Avoid |
| --- | --- |
| The Hands That Hold Us | the hands that hold us |
| A Ghost Truck | Ghost Truck Installation |
| Tower of Cower | Tower of Cower (2023) |

---

### Artists

Add all artists who created the installation. Click **+ Add** for multiple artists.

For each artist:

| Field | Description |
| --- | --- |
| **Full Name** | Their name as they want it credited |
| **Instagram Handle** | Username without the @ symbol (optional) |
| **Bio** | 2-4 sentence biography (optional, supports rich text) |

---

### Festival Year(s)

Select which year(s) this installation appeared.

- **2023** — First festival
- **2025** — Second festival
- Select multiple if it appeared in both years

---

### Step 3: Upload Hero Image

The **Hero Image** is the main promotional image at the top of the installation page.

### Specifications

| Property | Requirement |
| --- | --- |
| **Dimensions** | 1920px wide, landscape |
| **File Size** | Under 500KB |
| **Format** | JPG |
| **Content** | Best photo of the installation |

### How to Upload

1. Click the **Hero Image** field
2. Click **Upload** and select your image
3. The image automatically uploads to `/img/sketches/`

---

### Step 4: Write the Installation Description

The **Installation Description** explains the artwork. This is a required field.

### What to Include

- Artistic concept and vision
- Materials and construction methods
- How visitors interact with it
- Connection to festival themes (borders, migration, identity)

### Formatting

The description supports rich text:
- **Bold** and *italic* text
- Links to external resources
- Paragraph breaks

### Example

```
"The Hands that Hold Us" considers the people and stories that move across the borderlands. Mimicking the silhouette of a prickly pear cactus, the sculpture features concrete-cast-hands, cradling each other and culminating in a hand holding a phone which plays films.

The hands evoke the personhood and humanity of those who cross borders. The way in which they hold each other reminds us that often, people cross borders to support their communities and families.

The installation is lit with LEDs, built from concrete, double-sided, and made for outdoor exhibition.
```

---

### Step 5: Configure Films Screened

Installations display films during the festival. You have two options:

### Option 1: Show All Films Link (Recommended)

Check **Show All Films Link** to display "All selected films screened" with a link to the films page.

> 💡 Tip: Use this unless the installation screened a specific subset of films.

### Option 2: List Specific Films

1. Uncheck **Show All Films Link**
2. Use the **Films Screened** field to select specific films from the collection

---

### Step 6: Add Gallery Images

The **Gallery Images** appear in a masonry grid below the description.

### Specifications

| Property | Requirement |
| --- | --- |
| **Dimensions** | 1200px on longest side |
| **File Size** | Under 300KB each |
| **Format** | JPG |
| **Content** | Documentation, detail shots, audience interaction |

### How to Upload

1. Click **Gallery Images**
2. Click **Upload** and select multiple images
3. Images upload to `/img/installations/` or a custom folder

### Tips

- Include a variety: wide shots, detail shots, people interacting
- Order matters — first image shows first in the grid
- 4-8 images is a good range

---

### Step 7: Configure Display Options

### Nav Logo

Choose an icon that relates to the installation.

| Option | Best For |
| --- | --- |
| 📺 Installation | Default/general |
| 🚪 Door | Doorway themes |
| 🖐️ Hand Wave | Hand-related art |
| 🏆 Trophy | Award-winning |
| 🚚 Truck | Vehicle installations |
| ⛵ Boat | Water themes |
| 🗼 Tower | Tall structures |
| 🔦 Flashlight | Light-based art |
| 📢 Loudspeaker | Sound-based art |

### Page Background Color

Choose a color that complements your hero image.

---

### Step 8: Save and Preview

1. Click **Save** in the top right
2. Add a commit message (e.g., "Add The Hands That Hold Us installation")
3. Click **Save** to commit
4. Wait 1-2 minutes for deployment
5. Visit the site to see your installation!

---

### Complete Installation Example

```yaml
title: The Hands That Hold Us
authors:
  - name: Helen Atkins
    instagram: helenjuliet_art
  - name: Will Geusz
    instagram: willinandchillinarts
heroImage: /img/sketches/the-hands-that-hold-us.jpg
description: |
  <p>"The Hands that Hold Us" considers the people and stories that move across the borderlands...</p>
showAllFilms: true
navlogo: 🖐️ Hand Wave
backgroundcolor: Light Blue
year:
  - "2023"
  - "2025"
galleryImages:
  - /img/the-hands-that-hold-us/1.jpg
  - /img/the-hands-that-hold-us/2.jpg
  - /img/the-hands-that-hold-us/3.jpg
```

---

## 🤝 How to Add/Edit Sponsors

---

### Overview

Sponsor entries appear on the sponsors page, organized by tier (Organizers → Partners → Sponsors).

---

### Step 1: Create a New Sponsor

1. Click **Sponsors** in the sidebar
2. Click the **+ New** button in the top right
3. You'll see a form with all the fields described below

---

### Step 2: Fill Out Fields

### Organization Name

The full name of the sponsor or partner organization.

| ✅ Good Examples | ❌ Avoid |
| --- | --- |
| Fulcrum Fund | fulcrum fund |
| City of Albuquerque UETF | CoA |
| Currents New Media | Currents |

---

### Website URL

The sponsor's website including `https://`

```
https://www.516arts.org/opportunities/fulcrum-fund
```

> 💡 Tip: Link to the most relevant page, not just the homepage if there's a better option.

---

### Sponsorship Tier

Determines display order and grouping.

| Tier | Description | Display Order |
| --- | --- | --- |
| **organizer** | Core organizing partners (Dust Wave, etc.) | First |
| **partner** | Major funding partners and collaborators | Second |
| **sponsor** | Supporting sponsors | Third |

---

### Festival Year(s)

Select which year(s) this sponsor supported.

- **2023** — First festival
- **2025** — Second festival
- Select multiple if they sponsored both years

---

### Step 3: Upload Logo

### Specifications

| Property | Requirement |
| --- | --- |
| **Dimensions** | 400-500px square (or similar height horizontal) |
| **File Size** | Under 200KB |
| **Format** | PNG with transparent background (strongly preferred) |
| **Content** | Official organization logo |

### How to Upload

1. Click the **Logo** field
2. Click **Upload** and select your logo
3. The image automatically uploads to `/img/sponsors/`

### Logo Tips

- PNG with transparency works best
- Horizontal logos should have similar height to square ones
- Logos display at 50% container width and scale responsively
- Check the organization's website for press assets

---

### Step 4: Save and Preview

1. Click **Save** in the top right
2. Add a commit message (e.g., "Add Fulcrum Fund sponsor")
3. Click **Save** to commit
4. Wait 1-2 minutes for deployment
5. Visit the sponsors page to verify!

---

### Complete Sponsor Example

```yaml
name: Fulcrum Fund
url: https://www.516arts.org/opportunities/fulcrum-fund
logo: /img/sponsors/fulcrum.png
tier: partner
year:
  - "2023"
```

---

## 📢 How to Add/Edit Posts

---

### Overview

Posts are used for news and announcements about the festival, including:

- Film selection announcements
- Event details and recaps
- Grant acknowledgments
- General updates

---

### Step 1: Create a New Post

1. Click **Posts** in the sidebar
2. Click the **+ New** button in the top right
3. You'll see a form with all the fields described below

---

### Step 2: Fill Out Basic Fields

### Title

The article headline — make it informative and engaging.

| ✅ Good Examples | ❌ Avoid |
| --- | --- |
| Congratulations to our selected filmmakers! | Film news |
| Fronteras is back at Paseo! | Update |
| Thank you to our 2023 sponsors | Thanks |

---

### Description

A short summary for SEO and social sharing (max 160 characters).

```
Announcing the films selected to the 2023 Fronteras Micro-film Festival!
```

---

### Date

Publication date and time.

- Use the date picker
- Format: `yyyy-MM-dd HH:mm:ss`
- Use `15:00:00` for time consistency

> 💡 Tip: This determines sort order on the blog page (newest first).

---

### Tags

Categorize the post. Select the most appropriate tag:

| Tag | Use For |
| --- | --- |
| **event** | Festival dates, screenings, venues |
| **grant** | Funding acknowledgments |
| **winners** | Film selections, award announcements |
| **thanks** | Thank you posts, wrap-ups |
| **announcement** | General news |

> 💡 Tip: You can create new tags if needed.

---

### Nav Logo

Icon shown in navigation when viewing the post.

| Tag Type | Suggested Icon |
| --- | --- |
| winners | trophy |
| grant | cash |
| thanks | thanks |
| event | installation |
| announcement | announcement |

---

### Step 3: Upload Header Image

The **Image** appears at the top of the post.

### Specifications

| Property | Requirement |
| --- | --- |
| **Dimensions** | 1600×900px (16:9) |
| **File Size** | Under 350KB |
| **Format** | JPG or PNG |

### How to Upload

1. Click the **Image** field
2. Click **Upload** and select your image
3. The image automatically uploads to `/img/blog/`

---

### Step 4: Write the Post Content

The **Body** field uses HTML/Markdown for post content.

### Basic Formatting Reference

| What You Want | What to Write |
| --- | --- |
| *Italic text* | `*italic*` or `_italic_` |
| **Bold text** | `**bold**` |
| Line break | `<br>` |
| Heading | `### Heading Text` |
| Link | `[Link Text](https://url.com)` |
| Bullet list | `* Item one` (one per line) |

### Wrapping Content

Wrap your content in a full-width div:

```html
<div class="full-width-post" markdown=1>

Your content here...

</div>
```

### Adding Images in Content

```html
<img src="/img/blog/photo.jpg" alt="description" class="post-image">
```

### Adding Videos in Content

```html
<div class="flex-row" markdown="0">
  <div class="center-flex flex-column">
    <figure class="shop">
      <video width="100%" controls poster="">
        <source src="/img/blog/video.webm" type="video/webm" />
      </video>
      <figcaption>Video caption</figcaption>
    </figure>
  </div>
</div>
```

### Two-Column Layout

```html
<div class="flex-row" markdown="0">
  <div class="center-flex flex-column">
    <figure class="shop">
      <img src="/img/blog/image1.jpg">
      <figcaption>Caption 1</figcaption>
    </figure>
  </div>
  <div class="center-flex flex-column">
    <figure class="shop">
      <img src="/img/blog/image2.jpg">
      <figcaption>Caption 2</figcaption>
    </figure>
  </div>
</div>
```

---

### Step 5: Save and Preview

1. Click **Save** in the top right
2. Add a commit message (e.g., "Add film selection announcement")
3. Click **Save** to commit
4. Wait 1-2 minutes for deployment
5. Visit the posts page to verify!

---

### Complete Post Example

```markdown
---
title: Congratulations to our selected filmmakers!
description: Announcing the films selected to the 2023 Fronteras Micro-film Festival!
date: 2023-05-22 15:01:00
tags: winners
navlogo: trophy
layout: layouts/post.njk
image: /img/blog/tvs.jpg
---

<div class="full-width-post" markdown=1>

On behalf of everyone at [Dust Wave](https://dustwave.xyz), we're overjoyed to announce the selected films for the inaugural Fronteras Micro-film Festival!

**Coyote** -- Dusty Deen (USA)
**The Darkest Place** -- Jay Renteria, Ryan Lewis, Alonso Indacochea (USA)
**They Came From Planet X** -- Brandon Carter (USA)

Congratulations to the selected filmmakers!

</div>
```

---

## 📁 Media Library

---

### Folder Structure

| Folder | Contents | Auto-upload From |
| --- | --- | --- |
| `/img/films/` | Film stills, laurels | Films → Film Still |
| `/img/sketches/` | Installation hero images | Installations → Hero Image |
| `/img/sponsors/` | Sponsor logos | Sponsors → Logo |
| `/img/blog/` | Post header images | Posts → Image |
| `/img/[installation-name]/` | Installation gallery images | Manual |

---

### Uploading to Media

1. Click **Media** in the sidebar
2. Navigate to the appropriate folder
3. Click **Upload** and select your files

---

### Image Size Quick Reference

| Type | Dimensions | Max Size | Format |
| --- | --- | --- | --- |
| Film Still | 1920px wide | 500KB | JPG |
| Installation Hero | 1920px wide | 500KB | JPG |
| Installation Gallery | 1200px on longest side | 300KB | JPG |
| Sponsor Logo | 400-500px square | 200KB | PNG (transparent) |
| Post Header | 1600×900px | 350KB | JPG |
| Laurel Badge | Variable | 100KB | PNG (transparent) |

---

## 🔧 Troubleshooting

---

### Image not showing?

- Check the path starts with `/img/`
- Verify the filename matches exactly (case-sensitive)
- Make sure the image was uploaded to the correct folder

### YouTube video not embedding?

- Make sure you're using only the video ID, not the full URL
- Check that the video is public or unlisted (not private)
- Verify the ID is correct (11 characters)

### Changes not appearing on site?

- Wait 1-2 minutes for GitHub Actions to build and deploy
- Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check GitHub Actions for build errors
- Contact @Alonso Indacochea if issues persist

### Form won't save?

- Check that all required fields are filled
- Ensure image uploads completed successfully
- Try refreshing the page and re-entering data

---

## 📞 Support

For questions or issues, contact @Alonso Indacochea.

---

*Last updated: August 2026*
