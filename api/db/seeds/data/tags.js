export function buildTags({ databaseBuilder }) {
  const tagItems = [];
  let i = 0;
  tagItems.push(buildTag({ title: 'fruits', index: i++, databaseBuilder }));
  tagItems.push(buildTag({ title: 'légumes', index: i++, databaseBuilder }));
  tagItems.push(buildTag({ title: 'animaux', index: i++, databaseBuilder }));
  tagItems.push(buildTag({ title: 'plantes', index: i++, databaseBuilder }));
  tagItems.push(buildTag({ title: 'minéraux', index: i++, databaseBuilder }));

  return tagItems;
}

export function buildTag({ title, index, databaseBuilder }) {
  const tagId = `tag${index}`;
  const tag = {
    id: tagId,
    title,
    description: `description for ${tagId}`,
  };
  databaseBuilder.factory.buildTag(tag);
  return tag;
}
