import {Octokit} from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private folder: string;

  constructor(token: string, owner: string, repo: string, folder: string) {
    this.octokit = new Octokit({auth: token});
    this.owner = owner;
    this.repo = repo;
    this.folder = folder;
  }

  async uploadFile(
    fileBytes: Uint8Array,
    fileName: string,
    commitMessage: string
  ): Promise<string | null> {
    try {
      const base64Content = this.arrayBufferToBase64(fileBytes);
      const path = `${this.folder}/${fileName}`;

      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: path,
        message: commitMessage,
        content: base64Content,
      });

      if (response.data.content) {
        return response.data.content.download_url || null;
      }
      return null;
    } catch (error) {
      console.error('GitHub upload error:', error);
      return null;
    }
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

