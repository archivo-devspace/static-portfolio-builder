export function isSymlink(entry: any): boolean {
  const unixPerms = entry.vars?.unixPermissions ?? entry.externalFileAttributes;
  
  // unixPerms may be undefined; bail if so
  if (typeof unixPerms !== "number") {
    return false;
  }

  // Mask to extract file type bits
  const fileType = unixPerms & 0o170000;

  // 0o120000 means symbolic link
  return fileType === 0o120000;
}
