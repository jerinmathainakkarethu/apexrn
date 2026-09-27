-- Adds the home page FAQ section copy and its visibility switch.
-- Only fills in what is missing, so any existing content is left untouched.
UPDATE homepage_sections
SET content = JSON_SET(
  content,
  '$.faq', JSON_OBJECT(
    'eyebrow', 'Questions, answered',
    'title', 'Everything you want to ask before you start.',
    'copy', 'Straight answers about the schedule, the classes, and what to expect before you decide to join.',
    'button', 'See all questions'
  ),
  '$.sectionVisibility.faqs', JSON_EXTRACT('true', '$')
)
WHERE section_key = 'home'
  AND JSON_EXTRACT(content, '$.faq') IS NULL;
