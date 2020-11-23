export interface LatestReleaseResponse {
    url: string,
    assets_url: string,
    tag_name: string,
    assets: RepoReleaseAssets[]
}

interface RepoReleaseAssets {
    url: string,
    name: string,
    content_type: string,
    browser_download_url: string   
}