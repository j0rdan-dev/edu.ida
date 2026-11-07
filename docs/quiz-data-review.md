# Quiz data review

Reviewed on 2026-11-07. The quiz banks live in `public/data`; `src/data` contains catalog and game content rather than the four-option quiz records.

The inventory and structural audit covered all 97 quiz files and 7,588 questions. Targeted editorial revisions changed 1,121 questions in 59 files: 3,212 incorrect options, 719 correct-answer texts, and 766 question prompts. These counts overlap. Many correct-answer text changes come from converting padded true/false items into direct questions.

## Editorial approach

- Use related concepts and common mistakes: place-value and unit-conversion errors, confused grammar categories, plant reproduction stages, and competing explanations for physical processes.
- Replace generic filler such as “Можеби” and “Не знам” with substantive options. Where a true/false item could not support four meaningful choices, turn it into a direct question or a concrete scenario.
- Clarify conditions that affect correctness: normal atmospheric pressure, identical experimental conditions, white illumination, initially stationary objects, and a specified order for sentence-rearrangement exercises.
- Correct identified answer errors, including gravity, inclined planes, pulling a sled, dental hygiene, and the food-pyramid categories. Remove duplicate or numerically equivalent alternatives to correct answers.
- Preserve filenames, question counts and order, option keys, other metadata, and all 461 image strings. Existing answer-key positions remain the same; the content in the options was corrected where necessary.

## Fact-check references

| Topic | References used for factual corrections |
| --- | --- |
| Seasons, Antarctica, atmosphere, planets | [NASA: seasons](https://spaceplace.nasa.gov/seasons/en/), [Antarctica](https://www.nasa.gov/frequently-asked-questions-about-antarctica/), [atmospheric layers](https://science.nasa.gov/earth/earth-atmosphere/earths-atmosphere-a-multi-layered-cake/), [Solar System](https://solarsystem.nasa.gov/solar-system/our-solar-system/in-depth.amp) |
| Matter and evaporation | [ACS: matter](https://www.acs.org/content/dam/acsorg/msc/downloads/chapter-1/ch1-student-reading.pdf), [USGS: evaporation](https://www.usgs.gov/water-science-school/science/evaporation-and-water-cycle?page=1) |
| Forces and plate movement | [NASA: forces and acceleration](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/simplified-aircraft-motion/), [USGS: plate-driving forces](https://pubs.usgs.gov/gip/dynamic/unanswered.html) |
| Plant reproduction | [USA National Phenology Network: botany primer](https://www.usanpn.org/files/npn/reports/USA-NPN_Botany-Primer-2018.pdf), [Washington State University: basic botany](https://extension.wsu.edu/pnw-gardeners-handbook/basic-botany/) |
| Hygiene, teeth, sleep and activity | [CDC: handwashing](https://cdc.gov/clean-hands/data-research/facts-stats/), [coughing and sneezing](https://www.cdc.gov/hygiene/about/coughing-and-sneezing.html), [fluoride and brushing](https://www.cdc.gov/oral-health/prevention/about-fluoride.html), [children’s sleep](https://www.cdc.gov/healthy-schools/sleep/index.html), [physical activity](https://www.cdc.gov/physical-activity-basics/health-benefits/children.html) |
| Human rights | [UN: Universal Declaration](https://www.un.org/en/about-us/universal-declaration-of-human-rights), [UNICEF: inherent human rights](https://www.unicef.org/child-rights-convention/what-are-human-rights) |
| Illuminance | [NIST: lux](https://www.nist.gov/glossary-term/26871) |

## Validation

Run `npm run check:data` to check JSON structure, four nonempty distinct options, valid answer keys, generic filler, placeholder text, and standalone numeric alternatives equivalent to the correct answer. The numeric check understands simple fractions, mixed numbers, decimal commas, percentages, and common length, mass and capacity units. It preserves intentional case distinctions and ordinal notation exercises.

These checks do not establish the semantic truth of arbitrary prose, interpret images, or replace a teacher’s subject review. Textbook-specific reading-comprehension material was retained where the underlying passage was not available.

The application’s 60 tests and production build also passed. A comparison against the original data confirmed unchanged question counts, metadata, answer-key positions and image strings.
