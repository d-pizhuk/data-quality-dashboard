from enum import Enum


class ComplexStatementOperator(Enum):
    AND = 0
    OR = 1

relationship_completeness_statements = {
    "simple": [
        ("tsso:TechnicalCommittee", "tsso:belongsTo", "tsso:Organization"),
        ("tsso:Publication", "tsso:developedBy", "tsso:TechnicalCommittee"),
        ("tsso:ComponentRequirement", "ext:associatedTo", "ext:FoundationalRequirement"),
        ("tsso:Connection", "tsso:usesAlgorithm", "tsso:Algorithm"),
        ("tsso:Connection", "tsso:usesChannel", "tsso:Channel"),
        ("tsso:Connection", "tsso:usesProtocol", "tsso:Protocol"),
        ("tsso:Provision", "tsso:suggestsCounterMeasure", "tsso:CounterMeasure"),
        ("tsso:DeploymentNode", "tsso:partOfDeploymentSolution", "tsso:DeploymentSolution"),
        ("tsso:Device", "tsso:hasDevicePhysicalLimitation", "tsso:DevicePhysicalLimitation"),
        ("tsso:Device", "tsso:hasOS", "tsso:OperatingSystem"),
        ("tsso:RiskAssesement", "tsso:considersAsset", "tsso:Asset"),
        ("tsso:Service", "tsso:serviceProvidedBy", "tsso:Component"),
        ("tsso:Architecture", "tsso:describesSolution", "tsso:SolutionStructure"),
        ("tsso:ReferenceArchitecture", "tsso:referencesArchitecture", "tsso:Architecture"),
        ("tsso:System", "tsso:hasRequirement", "tsso:SystemRequirement"),
        ("tsso:Provision", "tsso:demandsCapability", "tsso:Capability"),
        ("tsso:ComponentRequirement", "tsso:applicableTo", "tsso:Component"),
        ("tsso:SWApplication", "tsso:runsOn", "tsso:Device"),
        ("tsso:Publication", "tsso:publishedBy", "tsso:Organization"),
        ("tsso:Publication", "tsso:hasStatus", "tsso:Status"),
        ("tsso:PublicationConstraint", "tsso:refersTo", "tsso:Publication"),
        ("tsso:RequirementDependencyConstraint", "tsso:dependsOn", "tsso:Provision"),
        ("tsso:CounterMeasure", "tsso:handles", "tsso:Vulnerability"),
        ("tsso:Supplier", "tsso:supplies", "tsso:Asset")
    ],
    "with_reversed_importance": [
        ("tsso:Component", "tsso:partOfComponentSolution", "tsso:ComponentSolution"),
        ("tsso:Component", "tsso:providesFunction", "tsso:Function"),
        ("tsso:Stakeholder", "tsso:ownsAsset", "tsso:Asset"),
        ("tsso:FrameworkElement", "tsso:consistOfFrameworkElement", "tsso:FrameworkElement"),
        ("tsso:NISTFunction", "tsso:hasCategory", "tsso:NISTCategory"),
        ("tsso:NISTCategory", "tsso:hasSubCategory", "tsso:NISTSubCategory"),
        ("tsso:Provision", "tsso:hasSupplementalGuidance", "tsso:SupplementalGuidance")
    ],
    "with_xsd_values": [
        ("tsso:Constraint", "tsso:isHard", "xsd:boolean"),
        ("tsso:OperatingSystem", "tsso:isRealTime", "xsd:boolean"),
        ("tsso:RiskAssesement", "tsso:hasTolerance", "xsd:boolean"),
        ("tsso:Device", "tsso:isEmbedded", "xsd:boolean"),
        ("tsso:Device", "tsso:isSpecialPurpose", "xsd:boolean"),
        ("tsso:Device", "tsso:isTransportable", "xsd:boolean"),
        ("tsso:Interface", "tsso:isAuthenticated", "xsd:boolean"),
        ("tsso:Interface", "tsso:isDebugInterface", "xsd:boolean"),
        ("tsso:Interface", "tsso:isRemote", "xsd:boolean"),
        ("tsso:Publication", "tsso:pages", "xsd:int"),
        ("tsso:Threat", "tsso:isInternal", "xsd:boolean"),
        ("tsso:Threat", "tsso:probability", "xsd:float"),
        ("tsso:Vulnerability", "tsso:isDisclosed", "xsd:boolean"),
        ("tsso:Vulnerability", "tsso:isSolved", "xsd:boolean")
    ],
    "complex": [
        [("tsso:Risk", "tsso:considersThreat", "tsso:Threat"), ("tsso:Risk", "tsso:considersVulnerability", "tsso:Vulnerability"), ComplexStatementOperator.OR],
        [("tsso:Connection", "tsso:connects", "tsso:Component"), [("tsso:Connection", "tsso:connectsSource", "_"), ("tsso:Connection", "tsso:connectsDestination", "_"), ComplexStatementOperator.AND], ComplexStatementOperator.OR]
    ] 
}