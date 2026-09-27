-- Restructures the about page content into four focused sections:
--   story (sectionEyebrow/sectionTitle/copy/copySecondary), philosophy,
--   credentials, principles.
-- The old "values" and "stats" keys are folded into the new blocks and removed.
UPDATE homepage_sections
SET content = JSON_REMOVE(
  JSON_SET(
    content,
    '$.copySecondary', 'I started APEX RN Prep after working alongside international nurses who were studying hard, paying for the right materials, and still walking into the exam feeling underprepared. The problem was rarely effort. It was that most preparation was built for a local classroom, not for nurses who had already done the work and simply needed a clear, structured way through.',
    '$.philosophy', JSON_OBJECT(
      'eyebrow', 'Teaching philosophy',
      'title', 'High-yield, concept-based, and coached live.',
      'copy', 'Every session is built around what actually moves a score: the concepts that come back again and again, explained in plain language, with visuals that make them easy to recall, and live coaching while you practise.',
      'items', JSON_ARRAY(
        JSON_OBJECT('title', 'Concept-based thinking', 'copy', 'Topics are taught as systems and patterns rather than memorised lists, so you can reason through an unfamiliar question instead of guessing.'),
        JSON_OBJECT('title', 'High-yield focus', 'copy', 'Limited time goes to what is tested most often, and every block is tied to the NCLEX-RN blueprint.'),
        JSON_OBJECT('title', 'Simplified visuals', 'copy', 'Clean diagrams, flowcharts, and comparison charts replace dense paragraphs, so the picture stays in your memory.'),
        JSON_OBJECT('title', 'Live coaching', 'copy', 'You practise in class and get feedback in the moment, instead of finding out where you are weak weeks later.')
      )
    ),
    '$.credentials', JSON_OBJECT(
      'eyebrow', 'Credentials',
      'title', 'Registered, experienced, and still teaching.',
      'copy', 'Placeholder copy. Replace with your verified professional details before the page goes live.',
      'items', JSON_ARRAY(
        JSON_OBJECT('value', 'TBD', 'label', 'RN license states'),
        JSON_OBJECT('value', 'TBD', 'label', 'Certifications'),
        JSON_OBJECT('value', 'TBD', 'label', 'Years teaching NCLEX'),
        JSON_OBJECT('value', 'TBD', 'label', 'Students taught')
      )
    ),
    '$.principles', JSON_OBJECT(
      'eyebrow', 'What matters in this work',
      'title', 'The values behind the program.',
      'items', JSON_ARRAY(
        JSON_OBJECT('title', 'Patient safety first', 'copy', 'Every topic comes back to the patient at the end of the question, even when the exam format changes.'),
        JSON_OBJECT('title', 'Honesty over hype', 'copy', 'If something is not tested, you will not be told it is high-yield, and you will not be sold a plan you do not need.'),
        JSON_OBJECT('title', 'Access for international nurses', 'copy', 'Good preparation should not depend on where you trained or which bridge course you could afford.'),
        JSON_OBJECT('title', 'Accountability to exam day', 'copy', 'Clear plans, honest checkpoints, and visible progress so you always know where you stand.')
      )
    )
  ),
  '$.values',
  '$.stats'
)
WHERE section_key = 'about';
