// grupo.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';

interface Permisos {
  tickets: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean; 
    cambiarEstado: boolean;
     comentar: boolean
    asignar: boolean;
  };
  grupos: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    agregarMiembros: boolean;
    quitarMiembros: boolean;
  };
  usuarios: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
}

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  miembros: string[];
}

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  fechaInicio: string;
  fechaFinalizacion: string;
  creadoPor: string;
  asignadoA: string;
  grupoId: number;
  comentarios?: any[];
}

@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.html',
  styleUrls: ['./grupo.css'],
  providers: [DatePipe],
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, DialogModule, InputTextModule, DragDropModule]
})
export class GrupoComponent implements OnInit, OnDestroy {

  grupoId: number = 0;
  grupo: Grupo | null = null;
  tickets: Ticket[] = [];
  ticketsFiltrados: Ticket[] = [];
  currentUserEmail: string = '';
  currentRole: string = '';
  currentUserPermisos: Permisos | null = null;
  private routeSubscription: Subscription | null = null;

  vistaActual: 'lista' | 'kanban' = 'lista';
  filtroEstado: string = 'todos';
  filtroPrioridad: string = 'todas';

  columnasKanban = [
    { titulo: 'Pendiente', estado: 'Pendiente', color: '#f59e0b' },
    { titulo: 'En Proceso', estado: 'En Proceso', color: '#3b82f6' },
    { titulo: 'Revisión', estado: 'Revisión', color: '#8b5cf6' },
    { titulo: 'Hecho', estado: 'Hecho', color: '#10b981' },
    { titulo: 'Bloqueado', estado: 'Bloqueado', color: '#ef4444' }
  ];

  displayTicketModal: boolean = false;
  modoTicket: 'crear' | 'editar' = 'crear';
  ticketEditandoId: number | null = null;

  ticketForm = {
    titulo: '',
    descripcion: '',
    estado: 'Pendiente',
    prioridad: 'Importante',
    fechaInicio: '',
    fechaFinalizacion: '',
    asignadoA: ''
  };

  constructor(
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  get columnasKanbanConectadas(): string[] {
    return this.columnasKanban.map((_, index) => `cdk-drop-list-${index}`);
  }

  ngOnInit() {
    // Cargar datos del usuario primero
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    this.currentUserEmail = user.email || '';
    this.currentRole = user.role || '';
    
    const currentUserData = users.find((u: any) => u.email === this.currentUserEmail);
    this.currentUserPermisos = currentUserData?.permisos || null;
    
    console.log('Usuario actual:', this.currentUserEmail, 'Rol:', this.currentRole);
    
    // Suscribirse a los parámetros de la ruta
    this.routeSubscription = this.route.params.subscribe(params => {
      const idParam = params['id'];
      this.grupoId = typeof idParam === 'string' ? parseInt(idParam, 10) : idParam;
      console.log('ID del grupo recibido:', this.grupoId, 'Tipo:', typeof this.grupoId);
      
      // Cargar datos del grupo
      this.cargarGrupo();
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  cargarGrupo() {
    console.log('=== CARGANDO GRUPO ===');
    
    if (!this.grupoId || this.grupoId === 0) {
      console.error('ID de grupo inválido');
      return;
    }
    
    const grupos: Grupo[] = JSON.parse(localStorage.getItem('grupos') || '[]');
    this.grupo = grupos.find((g: Grupo) => g.id === this.grupoId) || null;
    
    if (!this.grupo) {
      console.error('Grupo no encontrado con ID:', this.grupoId);
      return;
    }
    
    console.log('Grupo encontrado:', this.grupo);
    
    // Cargar tickets
    this.cargarTickets();
  }

  cargarTickets() {
    if (!this.tienePermiso('tickets', 'ver')) {
      console.log('Sin permiso para ver tickets');
      this.tickets = [];
      this.ticketsFiltrados = [];
      return;
    }
    
    const allTickets: Ticket[] = JSON.parse(localStorage.getItem('tickets') || '[]');
    console.log('Todos los tickets:', allTickets);
    
    // Filtrar tickets por grupoId
    this.tickets = allTickets.filter((t: Ticket) => {
      // Asegurar que ambos son números para la comparación
      const ticketGrupoId = typeof t.grupoId === 'string' ? parseInt(t.grupoId, 10) : t.grupoId;
      const match = ticketGrupoId === this.grupoId;
      if (match) {
        console.log(`Ticket coincide: ${t.titulo} (${t.id}) - grupoId: ${ticketGrupoId}`);
      }
      return match;
    });
    
    console.log(`Tickets filtrados para grupo ${this.grupo?.nombre} (ID: ${this.grupoId}):`, this.tickets);
    
    this.aplicarFiltros();
    this.cdr.detectChanges(); // Forzar actualización de la vista
  }

  tienePermiso(categoria: keyof Permisos, accion: string): boolean {
    if (this.currentRole === 'super') {
      return true;
    }
    if (!this.currentUserPermisos) {
      return false;
    }
    switch(categoria) {
      case 'tickets':
        return this.currentUserPermisos.tickets[accion as keyof typeof this.currentUserPermisos.tickets] || false;
      case 'grupos':
        return this.currentUserPermisos.grupos[accion as keyof typeof this.currentUserPermisos.grupos] || false;
      case 'usuarios':
        return this.currentUserPermisos.usuarios[accion as keyof typeof this.currentUserPermisos.usuarios] || false;
      default:
        return false;
    }
  }

  cambiarVista(vista: 'lista' | 'kanban') {
    this.vistaActual = vista;
  }

  aplicarFiltros() {
    this.ticketsFiltrados = this.tickets.filter(ticket => {
      let estadoMatch = true;
      let prioridadMatch = true;

      if (this.filtroEstado !== 'todos') {
        estadoMatch = ticket.estado === this.filtroEstado;
      }

      if (this.filtroPrioridad !== 'todas') {
        prioridadMatch = ticket.prioridad === this.filtroPrioridad;
      }

      return estadoMatch && prioridadMatch;
    });
  }

  obtenerTicketsPorEstado(estado: string): Ticket[] {
    return this.tickets.filter(t => t.estado === estado);
  }

  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'Pendiente': 'header-Pendiente',
      'En Proceso': 'header-En-Proceso',
      'Revisión': 'header-Revisión',
      'Hecho': 'header-Hecho',
      'Bloqueado': 'header-Bloqueado'
    };
    return estadoMap[estado] || '';
  }

  getPrioridadClass(prioridad: string): string {
    const prioridadMap: { [key: string]: string } = {
      'Importante': 'prioridad-importante',
      'Dar Prioridad': 'prioridad-dar-prioridad',
      'Principal': 'prioridad-principal',
      'Derecho de Prioridad': 'prioridad-derecho-de-prioridad',
      'Orden de Prioridad': 'prioridad-orden-de-prioridad'
    };
    return prioridadMap[prioridad] || '';
  }

  actualizarEstadoTicket(ticket: Ticket) {
    if (!this.tienePermiso('tickets', 'cambiarEstado')) {
      alert('No tienes permiso para cambiar el estado de tickets');
      return;
    }
    
    const allTickets: Ticket[] = JSON.parse(localStorage.getItem('tickets') || '[]');
    const index = allTickets.findIndex((t: Ticket) => t.id === ticket.id);
    if (index !== -1) {
      allTickets[index].estado = ticket.estado;
      localStorage.setItem('tickets', JSON.stringify(allTickets));
      this.cargarTickets();
    }
  }

  drop(event: CdkDragDrop<Ticket[]>) {
    if (!this.tienePermiso('tickets', 'cambiarEstado')) {
      alert('No tienes permiso para cambiar el estado de tickets');
      return;
    }
    
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const ticket = event.previousContainer.data[event.previousIndex];
      const containerId = event.container.id;
      const nuevoEstado = this.columnasKanban.find((_, index) =>
        `cdk-drop-list-${index}` === containerId
      )?.estado;

      if (nuevoEstado && ticket) {
        const allTickets: Ticket[] = JSON.parse(localStorage.getItem('tickets') || '[]');
        const ticketIndex = allTickets.findIndex((t: Ticket) => t.id === ticket.id);

        if (ticketIndex !== -1) {
          allTickets[ticketIndex].estado = nuevoEstado;
          localStorage.setItem('tickets', JSON.stringify(allTickets));
          this.cargarTickets();
        }
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  abrirModalTicket() {
    if (!this.tienePermiso('tickets', 'crear')) {
      alert('No tienes permiso para crear tickets');
      return;
    }
    
    this.modoTicket = 'crear';
    this.ticketEditandoId = null;
    const hoy = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    this.ticketForm = {
      titulo: '',
      descripcion: '',
      estado: 'Pendiente',
      prioridad: 'Importante',
      fechaInicio: hoy,
      fechaFinalizacion: '',
      asignadoA: ''
    };
    this.displayTicketModal = true;
  }

  editarTicket(ticket: Ticket) {
    if (!this.tienePermiso('tickets', 'editar')) {
      alert('No tienes permiso para editar tickets');
      return;
    }
    
    this.modoTicket = 'editar';
    this.ticketEditandoId = ticket.id;
    this.ticketForm = {
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      estado: ticket.estado,
      prioridad: ticket.prioridad,
      fechaInicio: ticket.fechaInicio,
      fechaFinalizacion: ticket.fechaFinalizacion || '',
      asignadoA: ticket.asignadoA
    };
    this.displayTicketModal = true;
  }

  cerrarModalTicket() {
    this.displayTicketModal = false;
    this.ticketForm = {
      titulo: '',
      descripcion: '',
      estado: 'Pendiente',
      prioridad: 'Importante',
      fechaInicio: '',
      fechaFinalizacion: '',
      asignadoA: ''
    };
  }

  guardarTicket() {
    if (!this.ticketForm.titulo) {
      alert('El título es obligatorio');
      return;
    }

    if (!this.grupo) {
      alert('Error: Grupo no encontrado');
      return;
    }

    const allTickets: Ticket[] = JSON.parse(localStorage.getItem('tickets') || '[]');

    if (this.modoTicket === 'crear') {
      const nuevoTicket: Ticket = {
        id: Date.now(),
        titulo: this.ticketForm.titulo,
        descripcion: this.ticketForm.descripcion,
        estado: this.ticketForm.estado,
        prioridad: this.ticketForm.prioridad,
        fechaInicio: this.ticketForm.fechaInicio,
        fechaFinalizacion: this.ticketForm.fechaFinalizacion || '',
        creadoPor: this.currentUserEmail,
        asignadoA: this.ticketForm.asignadoA || 'Todos',
        grupoId: this.grupo.id,
        comentarios: []
      };
      allTickets.push(nuevoTicket);
      console.log('Ticket creado con grupoId:', nuevoTicket.grupoId);
    } else {
      const index = allTickets.findIndex((t: Ticket) => t.id === this.ticketEditandoId);
      if (index !== -1) {
        allTickets[index] = {
          ...allTickets[index],
          titulo: this.ticketForm.titulo,
          descripcion: this.ticketForm.descripcion,
          estado: this.ticketForm.estado,
          prioridad: this.ticketForm.prioridad,
          fechaInicio: this.ticketForm.fechaInicio,
          fechaFinalizacion: this.ticketForm.fechaFinalizacion || '',
          asignadoA: this.ticketForm.asignadoA || 'Todos'
        };
      }
    }

    localStorage.setItem('tickets', JSON.stringify(allTickets));
    console.log('Tickets guardados. Total:', allTickets.length);
    
    this.cargarTickets();
    this.cerrarModalTicket();
    alert('Ticket guardado correctamente');
  }

  agregarComentario(ticket: Ticket, comentario: string) {
  if (!this.tienePermiso('tickets', 'comentar')) {
    alert('No tienes permiso para comentar en tickets');
    return;
  }
  
  if (!comentario.trim()) return;
  
  const nuevoComentario = {
    id: Date.now(),
    texto: comentario,
    usuario: this.currentUserEmail,
    fecha: new Date().toISOString()
  };
  
  if (!ticket.comentarios) ticket.comentarios = [];
  ticket.comentarios.push(nuevoComentario);
  
  const allTickets: Ticket[] = JSON.parse(localStorage.getItem('tickets') || '[]');
  const index = allTickets.findIndex((t: Ticket) => t.id === ticket.id);
  
  if (index !== -1) {
    allTickets[index] = ticket;
    localStorage.setItem('tickets', JSON.stringify(allTickets));
    this.cargarTickets();
  }
}
  eliminarTicket(ticket: Ticket) {
    if (!this.tienePermiso('tickets', 'eliminar')) {
      alert('No tienes permiso para eliminar tickets');
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar el ticket "${ticket.titulo}"?`)) {
      const allTickets: Ticket[] = JSON.parse(localStorage.getItem('tickets') || '[]');
      const ticketsFiltrados = allTickets.filter((t: Ticket) => t.id !== ticket.id);
      localStorage.setItem('tickets', JSON.stringify(ticketsFiltrados));
      this.cargarTickets();
    }
  }
  
}