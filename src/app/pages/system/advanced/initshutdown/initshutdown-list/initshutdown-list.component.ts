import { EntityTableConfig } from 'app/pages/common/entity/entity-table/entity-table.interface';
import { InitshutdownFormComponent } from '../initshutdown-form/initshutdown-form.component';
import { Component } from '@angular/core';
import { ModalService } from 'app/services/modal.service';
import { T } from '../../../../../translate-marker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-initshutdown-list',
  template: '<entity-table [title]="title" [conf]="this"></entity-table>',
})
export class InitshutdownListComponent implements EntityTableConfig {
  title = 'Init/Shutdown Scripts';
  queryCall: 'initshutdownscript.query' = 'initshutdownscript.query';
  wsDelete: 'initshutdownscript.delete' = 'initshutdownscript.delete';
  route_add: string[] = ['tasks', 'initshutdown', 'add'];
  protected route_add_tooltip = 'Add Init/Shutdown Scripts';
  route_edit: string[] = ['tasks', 'initshutdown', 'edit'];
  protected entityList: any;

  columns = [
    { name: T('Type'), prop: 'type' },
    { name: T('Command'), prop: 'command', hidden: true },
    { name: T('Script'), prop: 'script', hidden: true },
    { name: T('Description'), prop: 'comment' },
    { name: T('When'), prop: 'when' },
    { name: T('Enabled'), prop: 'enabled' },
    { name: T('Timeout'), prop: 'timeout', hidden: true },
  ];
  rowIdentifier = 'type';
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    deleteMsg: {
      title: T('Init/Shutdown Script'),
      key_props: ['type', 'command', 'script'],
    },
  };

  constructor(public modalService: ModalService) {}

  afterInit(entityList: any): void {
    this.entityList = entityList;

    this.modalService.onClose$.pipe(untilDestroyed(this)).subscribe(() => {
      this.entityList.loaderOpen = true;
      this.entityList.needRefreshTable = true;
      this.entityList.getData();
    });
  }

  doAdd(id?: number): void {
    this.modalService.open('slide-in-form', new InitshutdownFormComponent(this.modalService), id);
  }

  doEdit(id: number): void {
    this.doAdd(id);
  }
}
