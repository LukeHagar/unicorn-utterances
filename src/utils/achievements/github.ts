import { Octokit } from "octokit";
import { unicorns } from "src/utils/data";

const octokit =
	typeof process.env.GITHUB_TOKEN !== "undefined"
		? new Octokit({
				auth: process.env.GITHUB_TOKEN,
		  })
		: undefined;

if (!octokit)
	console.warn("No GITHUB_TOKEN provided - skipping unicorn achievements!");

export interface GitHubData {
	issueCount: number;
	pullRequestCount: number;
	commitsInYear: number[];
}

export const contributorYears: number[] = [];
for (let year = 2019; year <= new Date().getFullYear(); year++)
	contributorYears.push(year);

const userLogins = unicorns
	.filter((unicorn) => !!unicorn.socials.github)
	.map((unicorn) => unicorn.socials.github);

const userResult: Record<string, { id: string }> = await octokit?.graphql(`
query {
	${userLogins.map(
		(login, i) => `
	user${i}: user(login: "${login}") {
		id
	}
	`,
	)}
}
`);

const userIds: Record<string, string> = {};
if (userResult) {
	userLogins.forEach((login, i) => {
		userIds[login] = userResult[`user${i}`].id;
	});
}

const dataQuery = `
query($login: String, $id: ID, $prSearch: String!) {
	repository(owner: "unicorn-utterances", name: "unicorn-utterances") {
		defaultBranchRef {
			target {
				... on Commit {
					${contributorYears.map(
						(year) => `
					history${year}: history (first:1, since:"${year}-01-01T00:00:00.000Z", until:"${
						year + 1
					}-01-01T00:00:00.000Z", author:{id:$id}) {
						totalCount
					}
					`,
					)}
				}
			}
		}
		issues(filterBy:{ createdBy: $login }) {
			totalCount
		}
	}
	search(query: $prSearch, type:ISSUE) {
		issueCount
	}
}
`;

export async function fetchGitHubData(
	login: string,
): Promise<GitHubData | undefined> {
	if (!octokit) return undefined;

	// get the user's GitHub ID
	const id = userIds[login];
	if (!id) return undefined;

	const response = (await octokit.graphql(dataQuery, {
		login,
		id,
		prSearch: `repo:unicorn-utterances/unicorn-utterances is:pr author:${login}`,
	})) as {
		repository: {
			defaultBranchRef: {
				target: {
					[year: string]: {
						totalCount: number;
					};
				};
			};
			issues: {
				totalCount: number;
			};
		};
		search: {
			issueCount: number;
		};
	};

	const commitsInYear = contributorYears.filter(
		(year) =>
			response.repository.defaultBranchRef.target[`history${year}`].totalCount >
			0,
	);

	return {
		issueCount: response.repository.issues.totalCount,
		pullRequestCount: response.search.issueCount,
		commitsInYear,
	};
}
