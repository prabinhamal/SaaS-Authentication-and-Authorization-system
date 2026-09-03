

import { AuthZService } from "./authZ.service";
import { DecisionEngine } from "./engine/decision.engine";
import { DecisionComposer } from "./engine/decisionComposer";
import { RBACEvaluator } from "./evaluators/RBAC/rbac.evaluator";
import { RoleRepository } from "./models/RBAC/role.repository";
import { RoleService } from "./models/RBAC/role.service";
import { RoleAssignmentRepository } from "./models/RBAC/roleAssignment.repository";
import { RoleAssignmentService } from "./models/RBAC/roleAssignment.service";
import { RoleHierarchyService } from "./models/RBAC/roleHierarchy.service";

export class AuthZContainer {
  readonly roleRepository: RoleRepository;
  readonly roleAssignmentRepository: RoleAssignmentRepository;

  readonly roleService: RoleService;
  readonly roleAssignmentService: RoleAssignmentService;

  readonly rbacEvaluator: RBACEvaluator;
  readonly decisionComposer: DecisionComposer;
  readonly decisionEngine: DecisionEngine;

  readonly authZService: AuthZService;

  readonly roleHierarchyService: RoleHierarchyService;

  constructor() {
    this.roleRepository = new RoleRepository();
    this.roleAssignmentRepository = new RoleAssignmentRepository();

    this.roleService = new RoleService(
      this.roleRepository,
    );

    this.roleAssignmentService = new RoleAssignmentService(
      this.roleAssignmentRepository,
      this.roleRepository,
    );

    this.roleHierarchyService = new RoleHierarchyService(
      this.roleRepository, 
      this.roleService
    );

    this.rbacEvaluator = new RBACEvaluator(
      this.roleAssignmentService,
      this.roleHierarchyService
    );

    this.decisionComposer = new DecisionComposer();

    this.decisionEngine = new DecisionEngine(
      this.decisionComposer,
      this.rbacEvaluator,
    );

    this.authZService = new AuthZService(
      this.decisionEngine,
    );
  }
}