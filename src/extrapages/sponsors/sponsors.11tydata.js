// Helper to slugify a string
function slugify(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Map tier to sort order (organizers first, then partners, then sponsors)
function tierOrder(tier) {
  const order = { organizer: 0, partner: 1, sponsor: 2 };
  return order[tier] ?? 3;
}

module.exports = {
  eleventyComputed: {
    // Sponsors don't need individual pages, so set permalink to false
    permalink: false,
    // Add tier order for sorting
    tierOrder: data => tierOrder(data.tier)
  }
};
