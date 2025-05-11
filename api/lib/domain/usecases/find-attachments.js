export function findAttachments({ query, attachmentRepository }) {
  return attachmentRepository.listByLocalizedChallengeIds(query.localizedChallengeIds);
}
