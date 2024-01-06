import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";

import {
	Component,
	Input,
	EventEmitter,
	Output,
	OnInit,
	OnDestroy,
} from "@angular/core";
import { NgFor, NgIf, DatePipe } from "@angular/common";

@Component({
	selector: "file-date",
	standalone: true,
	imports: [DatePipe],
	template: `
		<span [attr.aria-label]="inputDate | date: 'MMMM d, Y'">
			{{ inputDate | date }}
		</span>
	`,
})
class FileDateComponent {
	@Input() inputDate!: Date;
}

@Component({
	selector: "tr[file-item]",
	standalone: true,
	imports: [FileDateComponent, NgIf],
	host: {
		"[attr.aria-selected]": "isSelected",
		"(click)": "selected.emit()",
		"[style]": `
			isSelected ?
				'background-color: blue; color: white' :
				'background-color: white; color: blue'
		`,
	},
	template: `
		<td>
			<a [href]="href" style="color: inherit">{{ fileName }}</a>
		</td>
		<td *ngIf="isFolder; else fileDisplay">Type: Folder</td>
		<ng-template #fileDisplay><td>Type: File</td></ng-template>
		<td><file-date *ngIf="!isFolder" [inputDate]="inputDate" /></td>
	`,
})
class FileComponent implements OnInit, OnDestroy {
	@Input() fileName!: string;
	@Input() href!: string;
	@Input() isSelected!: boolean;
	@Input() isFolder!: boolean;
	@Output() selected = new EventEmitter();
	inputDate = new Date();
	interval: any = null;

	ngOnInit() {
		// Check if it's a new day every 10 minutes
		this.interval = setInterval(
			() => {
				const newDate = new Date();
				if (this.inputDate.getDate() === newDate.getDate()) return;
				this.inputDate = newDate;
			},
			10 * 60 * 1000,
		);
	}

	ngOnDestroy() {
		clearInterval(this.interval);
	}
}

@Component({
	selector: "tbody[file-table-body]",
	standalone: true,
	imports: [NgFor, NgIf, FileComponent],
	template: `
		<ng-container
			*ngFor="let file of filesArray; let i = index; trackBy: fileTrackBy"
		>
			<tr
				file-item
				*ngIf="onlyShowFiles ? !file.isFolder : true"
				(selected)="onSelected(i)"
				[isSelected]="selectedIndex === i"
				[fileName]="file.fileName"
				[href]="file.href"
				[isFolder]="file.isFolder"
			></tr>
		</ng-container>
	`,
})
class FileTableBody {
	selectedIndex = -1;

	fileTrackBy(index: number, file: File) {
		return file.id;
	}

	onSelected(idx: number) {
		if (this.selectedIndex === idx) {
			this.selectedIndex = -1;
			return;
		}
		this.selectedIndex = idx;
	}

	@Input() onlyShowFiles = false;

	filesArray: File[] = [
		{
			fileName: "File one",
			href: "/file/file_one",
			isFolder: false,
			id: 1,
		},
		{
			fileName: "File two",
			href: "/file/file_two",
			isFolder: false,
			id: 2,
		},
		{
			fileName: "File three",
			href: "/file/file_three",
			isFolder: false,
			id: 3,
		},
		{
			fileName: "Folder one",
			href: "/file/folder_one/",
			isFolder: true,
			id: 4,
		},
		{
			fileName: "Folder two",
			href: "/file/folder_two/",
			isFolder: true,
			id: 5,
		},
	];
}

@Component({
	selector: "file-table",
	standalone: true,
	imports: [NgFor, NgIf, FileTableBody],
	template: `
		<div>
			<button (click)="toggleOnlyShow()" style="margin-bottom: 1rem">
				Only show files
			</button>
			<table style="border-collapse: collapse;">
				<tbody file-table-body [onlyShowFiles]="onlyShowFiles"></tbody>
			</table>
		</div>
	`,
})
class FileTableComponent {
	onlyShowFiles = false;

	toggleOnlyShow() {
		this.onlyShowFiles = !this.onlyShowFiles;
	}
}

@Component({
	selector: "app-root",
	standalone: true,
	imports: [FileTableComponent],
	template: `<file-table />`,
})
class AppComponent {}

interface File {
	fileName: string;
	href: string;
	isFolder: boolean;
	id: number;
}

bootstrapApplication(AppComponent);
