import "zone.js/dist/zone";
import { bootstrapApplication } from "@angular/platform-browser";

import { Component, Input, EventEmitter, Output } from "@angular/core";

@Component({
	selector: "expandable-dropdown",
	standalone: true,
	template: `
		<div>
			<button (click)="toggle.emit()">
				{{ expanded ? "V" : ">" }}
				{{ name }}
			</button>
			<div [hidden]="!expanded">More information here</div>
		</div>
	`,
})
export class ExpandableDropdownComponent {
	@Input() name!: string;
	@Input() expanded!: boolean;
	@Output() toggle = new EventEmitter();
}

@Component({
	selector: "app-sidebar",
	standalone: true,
	imports: [ExpandableDropdownComponent],
	template: `
		<expandable-dropdown
			name="Movies"
			[expanded]="moviesExpanded"
			(toggle)="moviesExpanded = !moviesExpanded"
		/>
		<expandable-dropdown
			name="Pictures"
			[expanded]="picturesExpanded"
			(toggle)="picturesExpanded = !picturesExpanded"
		/>
		<expandable-dropdown
			name="Concepts"
			[expanded]="conceptsExpanded"
			(toggle)="conceptsExpanded = !conceptsExpanded"
		/>
		<expandable-dropdown
			name="Articles I'll Never Finish"
			[expanded]="articlesExpanded"
			(toggle)="articlesExpanded = !articlesExpanded"
		/>
		<expandable-dropdown
			name="Website Redesigns v5"
			[expanded]="redesignExpanded"
			(toggle)="redesignExpanded = !redesignExpanded"
		/>
		<expandable-dropdown
			name="Invoices"
			[expanded]="invoicesExpanded"
			(toggle)="invoicesExpanded = !invoicesExpanded"
		/>
	`,
})
export class SidebarComponent {
	moviesExpanded = true;
	picturesExpanded = false;
	conceptsExpanded = false;
	articlesExpanded = false;
	redesignExpanded = false;
	invoicesExpanded = false;
}

bootstrapApplication(SidebarComponent);
