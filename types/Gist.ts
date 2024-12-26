export interface GistFile {
    filename: string;
    type: string;
    language: string;
    raw_url: string;
    size: number;
  }
  
  export interface Gist {
    url: string;
    forks_url: string;
    commits_url: string;
    id: string;
    node_id: string;
    git_pull_url: string;
    git_push_url: string;
    html_url: string;
    files: {
      [fileName: string]: GistFile;
    };
    public: boolean;
    created_at: string;
    updated_at: string;
    description?: string;
    comments: number;
    user?: any; // Omit or define user type if you need
    comments_url: string;
    owner?: any; // Omit or define owner type if you need
    truncated: boolean;
    forks?: Gist[];
    history?: Gist[];
  }
  
  export interface GistFetched extends Gist {
    content: string; // the content of the first file
    language: string; // the language of the first file
  }
  